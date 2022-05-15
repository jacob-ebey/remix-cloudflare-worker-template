export default class RateLimiter {
  private nextAllowedTime: number = 0;

  // Our protocol is: POST when the IP performs an action, or GET to simply read the current limit.
  // Either way, the result is the number of seconds to wait before allowing the IP to perform its
  // next action.
  async fetch(request: Request) {
    let now = Date.now() / 1000;

    this.nextAllowedTime = Math.max(now, this.nextAllowedTime);

    if (request.method == "POST") {
      // POST request means the user performed an action.
      // We allow one action per seconds.
      ++this.nextAllowedTime;
    }

    // Return the number of seconds that the client needs to wait.
    //
    // We provide a "grace" period of 20 seconds, meaning that the client can make 4-5 requests
    // in a quick burst before they start being limited.
    let cooldown = Math.max(0, this.nextAllowedTime - now - 20);
    return new Response(String(cooldown));
  }
}

// RateLimiterClient implements rate limiting logic on the caller's side.
export class RateLimiterClient {
  private inCooldown: boolean = false;
  private limiter: DurableObjectStub;

  constructor(
    private getLimiterStub: () => DurableObjectStub,
    private reportError: (error: unknown) => void
  ) {
    // Call the callback to get the initial stub.
    this.limiter = getLimiterStub();
  }

  // Call checkLimit() when a message is received to decide if it should be blocked due to the
  // rate limit. Returns `true` if the message should be accepted, `false` to reject.
  checkLimit() {
    if (this.inCooldown) {
      return false;
    }
    this.inCooldown = true;
    this.callLimiter();
    return true;
  }

  // callLimiter() is an internal method which talks to the rate limiter.
  async callLimiter() {
    try {
      let response;
      try {
        // Currently, fetch() needs a valid URL even though it's not actually going to the
        // internet. We may loosen this in the future to accept an arbitrary string. But for now,
        // we have to provide a dummy URL that will be ignored at the other end anyway.
        response = await this.limiter.fetch("https://.../", {
          method: "POST",
        });
      } catch (err) {
        // `fetch()` threw an exception. This is probably because the limiter has been
        // disconnected. Stubs implement E-order semantics, meaning that calls to the same stub
        // are delivered to the remote object in order, until the stub becomes disconnected, after
        // which point all further calls fail. This guarantee makes a lot of complex interaction
        // patterns easier, but it means we must be prepared for the occasional disconnect, as
        // networks are inherently unreliable.
        //
        // Anyway, get a new limiter and try again. If it fails again, something else is probably
        // wrong.
        this.limiter = this.getLimiterStub();
        response = await this.limiter.fetch("https://.../", {
          method: "POST",
        });
      }

      // The response indicates how long we want to pause before accepting more requests.
      let cooldown = +(await response.text());
      await new Promise((resolve) => setTimeout(resolve, cooldown * 1000));

      // Done waiting.
      this.inCooldown = false;
    } catch (err) {
      this.reportError(err);
    }
  }
}
