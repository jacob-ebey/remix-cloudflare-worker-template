import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";

import { getSession } from "~/session.server";

type LoaderData = {
  loaderCalls: number;
  username?: string;
};

export let loader: LoaderFunction = async ({ context: { env }, request }) => {
  let sessionPromise = getSession(request, env);

  let counter = env.COUNTER.get(env.COUNTER.idFromName("index"));
  let loaderCalls = await counter
    .fetch("https://.../increment")
    .then((response) => response.text())
    .then((text) => Number.parseInt(text, 10));

  let session = await sessionPromise;
  let username = (session.get("username") || undefined) as string | undefined;

  return json<LoaderData>({ loaderCalls, username });
};

export default function Index() {
  let { loaderCalls, username } = useLoaderData() as LoaderData;

  return (
    <main>
      <Form method="post" id="username-form">
        <label>
          Choose a username:
          <br />
          <input
            name="username"
            placeholder="username"
            required
            maxLength={32}
            defaultValue={username}
          />
        </label>
        <button disabled type="submit" style={{ display: "none" }} />
      </Form>
      <p>then</p>
      <p>
        <button type="submit" form="username-form" formAction="/new">
          Create a Private Room
        </button>
      </p>
      <p>or</p>
      <label>
        Enter a public room:
        <br />
        <input
          form="username-form"
          name="room"
          type="text"
          autoCapitalize="off"
          placeholder="room-name"
        />
      </label>
      <button type="submit" form="username-form" formAction="/join">
        GO!
      </button>

      <hr />
      <footer>
        <p>index loader invocations: {loaderCalls}</p>
      </footer>
    </main>
  );
}
