export default class CounterDurableObject {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request) {
    let url = new URL(request.url);

    let value = (await this.state.storage.get<number>("value")) || 0;
    switch (url.pathname) {
      case "/increment":
        ++value;
        break;
      case "/decrement":
        --value;
        break;
      case "/":
        // Just serve the current value. No storage calls needed!
        break;
      default:
        return new Response("Not found", { status: 404 });
    }

    await this.state.storage?.put("value", value);

    return new Response(value.toString());
  }
}
