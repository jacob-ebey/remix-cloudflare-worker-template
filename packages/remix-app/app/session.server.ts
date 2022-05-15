import type { Session } from "@remix-run/cloudflare";
import { createCookieSessionStorage } from "@remix-run/cloudflare";

function getSessionStorage(env: Env) {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not defined");

  return createCookieSessionStorage({
    cookie: {
      httpOnly: true,
      name: "remix-cloudflare-worker-chat-room",
      path: "/",
      sameSite: "lax",
      secrets: [env.SESSION_SECRET],
    },
  });
}

export function commitSession(session: Session, env: Env) {
  let sessionStorage = getSessionStorage(env);

  return sessionStorage.commitSession(session);
}

export function destroySession(session: Session, env: Env) {
  let sessionStorage = getSessionStorage(env);

  return sessionStorage.destroySession(session);
}

export function getSession(requestOrCookie: Request | string | null, env: Env) {
  let cookie =
    typeof requestOrCookie === "string"
      ? requestOrCookie
      : requestOrCookie?.headers.get("Cookie");

  let sessionStorage = getSessionStorage(env);

  return sessionStorage.getSession(cookie);
}
