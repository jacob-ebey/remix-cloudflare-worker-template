export async function handleErrors(
  request: Request,
  func: () => Response | Promise<Response>
) {
  try {
    return await func();
  } catch (err) {
    if (request.headers.get("Upgrade") == "websocket") {
      // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
      // won't show us the response body! So... let's send a WebSocket response with an error
      // frame instead.
      let [client, server] = Object.values(new WebSocketPair());
      // @ts-expect-error
      server.accept();
      server.close(1011, "Uncaught exception during session setup");
      return new Response(null, { status: 101, webSocket: client });
    } else {
      return new Response("Uncaught exception", { status: 500 });
    }
  }
}
