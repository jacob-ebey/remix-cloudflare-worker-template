import type { PropsWithChildren } from "react";
import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useMatches,
} from "@remix-run/react";

export let meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  loaderCalls: number;
};

export let loader: LoaderFunction = async ({ context: { env } }) => {
  let counter = env.COUNTER.get(env.COUNTER.idFromName("root"));
  let counterResponse = await counter.fetch("https://.../increment");
  let loaderCalls = Number.parseInt(await counterResponse.text());

  return json<LoaderData>({ loaderCalls });
};

function Document({ children }: PropsWithChildren<{}>) {
  let matches = useMatches();
  let root = matches.find((match) => match.id === "root");
  let data = root?.data as LoaderData | undefined;

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@exampledev/new.css@1.1.3/new.css"
        />
      </head>
      <body>
        <header>
          <h1>
            <Link to="/">Remix Chat</Link>
          </h1>
          <p>
            This chat runs entirely on the edge, powered by Cloudflare Workers
            Durable Objects
          </p>
        </header>
        {children}
        {data && (
          <>
            <hr />
            <footer>root loader invocations: {data.loaderCalls}</footer>
          </>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  let { status, statusText } = useCatch();

  return (
    <Document>
      <main>
        <h1>{status}</h1>
        {statusText && <p>{statusText}</p>}
      </main>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.log(error);

  return (
    <Document>
      <main>
        <h1>Oops, looks like something went wrong 😭</h1>
      </main>
    </Document>
  );
}
