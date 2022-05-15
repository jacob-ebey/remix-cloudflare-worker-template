import type { ActionFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { commitSession, getSession } from "~/session.server";
import { normalizeRoomName } from "~/utils";

export let action: ActionFunction = async ({ context: { env }, request }) => {
  let formData = await request.formData();
  let room = formData.get("room") || "";
  let username = formData.get("username") || "";

  if (
    typeof room !== "string" ||
    !room ||
    typeof username !== "string" ||
    !username
  ) {
    return redirect("/");
  }

  try {
    let sessionPromise = getSession(request, env);

    let id = env.CHAT_ROOM.idFromName(normalizeRoomName(room)).toString();

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
