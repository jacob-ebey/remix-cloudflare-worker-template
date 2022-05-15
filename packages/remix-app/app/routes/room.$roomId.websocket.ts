import type { LoaderFunction } from "@remix-run/cloudflare";

export let loader: LoaderFunction = async ({
  context: { env },
  params: { roomId },
  request,
}) => {
  if (!roomId) {
    return new Response("Invalid room id", { status: 400 });
  }
  let chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromString(roomId));

  let url = new URL(request.url);
  return chatRoom.fetch(`${url.protocol}//.../websocket`, request);
};
