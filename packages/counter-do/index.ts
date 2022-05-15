export default class CounterDurableObject {
  private value: number = 0;

  constructor(private state: DurableObjectState) {
    this.state.blockConcurrencyWhile(async () => {
      let storedValue = await this.state.storage.get<number>("value");
      this.value = storedValue || 0;
    });
  }

  async fetch(request: Request) {
    let url = new URL(request.url);

    let value = this.value;
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

    this.value = value;
    this.state.storage.put("value", value);

    return new Response(value.toString());
  }
}
