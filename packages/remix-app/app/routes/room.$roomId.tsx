import type { KeyboardEventHandler } from "react";
import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useLocation } from "@remix-run/react";
import type { Message } from "chat-room-do";

import { commitSession, getSession } from "~/session.server";

type LoaderData = {
  loaderCalls: number;
  latestMessages: Message[];
  roomId: string;
  username: string;
};

export let action: ActionFunction = async ({ context: { env }, request }) => {
  let formData = await request.formData();
  let username = formData.get("username") || "";

  if (!username) {
    throw json(null, { status: 401 });
  }

  let session = await getSession(request, env);
  session.set("username", username);

  let url = new URL(request.url);
  return redirect(url.pathname, {
    headers: { "Set-Cookie": await commitSession(session, env) },
  });
};

export let loader: LoaderFunction = async ({
  context: { env },
  params: { roomId },
  request,
}) => {
  roomId = roomId?.trim();
  let session = await getSession(request, env);
  let username = session.get("username") as string | undefined;

  if (!roomId) {
    return redirect("/");
  }

  if (!username) {
    throw json(null, { status: 401 });
  }

  let chatRoom = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromString(roomId));
  let latestMessages = chatRoom
    .fetch("https://.../latest")
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(
          "Something went wrong loading latest messages\n" + response.text()
        );
      }
      return response;
    })
    .then((response) => response.json<Message[]>());

  let counter = env.COUNTER.get(env.COUNTER.idFromName(`room.${roomId}`));
  let loaderCalls = counter
    .fetch("https://.../increment")
    .then((response) => response.text())
    .then((text) => Number.parseInt(text, 10));

  return json<LoaderData>({
    roomId,
    loaderCalls: await loaderCalls,
    latestMessages: await latestMessages,
    username,
  });
};

export default function Room() {
  let { key: locationKey } = useLocation();
  let { loaderCalls, latestMessages, roomId, username } =
    useLoaderData() as LoaderData;

  let [newMessages, setNewMessages] = useState<Message[]>([]);
  let [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    let hostname = window.location.host;
    if (!hostname) return;

    let socket = new WebSocket(
      `${
        window.location.protocol.startsWith("https") ? "wss" : "ws"
      }://${hostname}/room/${roomId}/websocket`
    );
    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ name: username }));
    });

    socket.addEventListener("message", (event) => {
      let data = JSON.parse(event.data);
      if (data.error) {
        console.error(data.error);
        return;
      } else if (data.joined) {
        console.log(`${data.joined} joined`);
      } else if (data.quit) {
        console.log(`${data.quit} quit`);
      } else if (data.ready) {
        setSocket(socket);
      } else if (data.message) {
        setNewMessages((previousValue) => [data, ...previousValue]);
      }
    });

    return () => {
      socket.close();
    };
  }, [roomId, username, locationKey, setNewMessages]);

  let handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      let input = event.currentTarget;
      let message = input.value;
      input.value = "";
      if (socket) {
        socket.send(JSON.stringify({ message }));
      }
    }
  };

  return (
    <main>
      <dl>
        <dt>Room ID</dt>
        <dd style={{ wordBreak: "break-all" }}>{roomId}</dd>
        <dt>Visits</dt>
        <dd>{loaderCalls}</dd>
      </dl>
      <hr />
      <label>
        Send a message:
        <br />
        <input
          type="text"
          name="message"
          onKeyDown={handleKeyDown}
          disabled={!socket}
        />
      </label>
      <hr />
      <ul>
        {newMessages.map((message) => (
          <li key={`${message.timestamp}${message.name}${message.message}`}>
            <strong>{message.name}</strong>: {message.message}
          </li>
        ))}
        {latestMessages.map((message) => (
          <li key={`${message.timestamp}${message.name}${message.message}`}>
            <strong>{message.name}</strong>: {message.message}
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CatchBoundary() {
  return (
    <main>
      <Form method="post">
        <input type="text" name="username" placeholder="username" />
        <button>Go!</button>
      </Form>
    </main>
  );
}
