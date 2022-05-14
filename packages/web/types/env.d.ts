/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare/globals" />

interface Env {
  __STATIC_CONTENT: KVNamespace;

  COUNTER: DurableObjectNamespace;
}

interface LoadContext {
  env: Env;
}

declare module "@remix-run/cloudflare" {
  import type { DataFunctionArgs as RemixDataFunctionArgs } from "@remix-run/cloudflare";
  export * from "@remix-run/cloudflare/index";

  interface DataFunctionArgs extends Omit<RemixDataFunctionArgs, "context"> {
    context: LoadContext;
  }

  export interface ActionFunction {
    (args: DataFunctionArgs): null | Response | Promise<Response>;
  }

  export interface LoaderFunction {
    (args: DataFunctionArgs): null | Response | Promise<Response>;
  }
}
