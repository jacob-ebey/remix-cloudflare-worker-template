import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  loaderCalls: number;
};

export let loader: LoaderFunction = async ({ context: { env } }) => {
  let counter = env.COUNTER.get(env.COUNTER.idFromName("index"));
  let counterResponse = await counter.fetch("https://.../increment");
  let loaderCalls = Number.parseInt(await counterResponse.text());

  return json<LoaderData>({ loaderCalls });
};

export default function Index() {
  let { loaderCalls } = useLoaderData() as LoaderData;

  return (
    <main>
      <h1>Hello, world!</h1>
      <p>Welcome to your new Remix app.</p>
      <p>index loader invocations: {loaderCalls}</p>
    </main>
  );
}
