interface Env {
  __STATIC_CONTENT: KVNamespace;

  CHAT_ROOM: DurableObjectNamespace;
  COUNTER: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;

  SESSION_SECRET: string;
}
