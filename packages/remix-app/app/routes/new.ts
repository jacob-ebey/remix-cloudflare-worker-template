import type { ActionFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { commitSession, getSession } from "~/session.server";

export let action: ActionFunction = async ({ context: { env }, request }) => {
  try {
    let sessionPromise = getSession(request, env);

    let formData = await request.formData();
    let username = formData.get("username") || "";

    if (typeof username !== "string" || !username) {
      return redirect("/");
    }

    let id = env.CHAT_ROOM.newUniqueId().toString();

    let session = await sessionPromise;
    session.set("username", username);

    return redirect(`/room/${id}`, {
      headers: {
        "Set-Cookie": await commitSession(session, env),
      },
    });
  } catch (error) {
    return redirect("/");
  }
};

export let loader = () => redirect("/");

export default () => null;
