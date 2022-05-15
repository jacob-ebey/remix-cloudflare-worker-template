import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";

type LoaderData = {
  loaderCalls: number;
};

export let loader: LoaderFunction = async ({ context: { env } }) => {
  let counter = env.COUNTER.get(env.COUNTER.idFromName("index"));
  let loaderCalls = await counter
    .fetch("https://.../increment")
    .then((response) => response.text())
    .then((text) => Number.parseInt(text, 10));

  return json<LoaderData>({ loaderCalls });
};

export default function Index() {
  let { loaderCalls } = useLoaderData() as LoaderData;

  return (
    <main>
      <Form method="post" id="username-form">
        <label>
          Choose a username:
          <br />
          <input
            name="username"
            placeholder="username"
            maxLength={32}
            required
          />
        </label>
        <p>then</p>
        <p>
          <button type="submit" formAction="/new">
            Create a Private Room
          </button>
        </p>
        <p>or</p>
        <label>
          Enter a public room:
          <br />
          <input
            name="room"
            type="text"
            autoCapitalize="off"
            placeholder="room-name"
          />
        </label>
        <button type="submit" formAction="/join">
          GO!
        </button>
      </Form>

      <hr />
      <footer>
        <p>index loader invocations: {loaderCalls}</p>
      </footer>
    </main>
  );
}
