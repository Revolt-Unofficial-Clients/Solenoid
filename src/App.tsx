import Axios from "axios";
import { Reaction, runInAction } from "mobx";
import type { Message } from "revolt.js";
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  enableExternalSource,
  For,
  Show,
} from "solid-js";
import { produce } from "solid-js/store";
import { ulid } from "ulid";
import "./styles/main.css";
import { createLocalSignal, createLocalStore, debounce } from "./utils";

import { uploadAttachment } from "revolt-toolset";

// Components
import { ChannelList } from "./components/ui/navigation/ChannelList";
import { Login as LoginComponent } from "./components/ui/common/Login";
import { Message as MessageComponent } from "./components/ui/messaging/Message";
import { Picker } from "./components/ui/experiments/Picker/picker";
import { ServerList } from "./components/ui/navigation/ServerList";

// Types
import type { AxiosRequestConfig } from "axios";
import type { reply, server, settings as config, status, user } from "./types";

// Icons
import {
  FiLogOut,
  FiPlusCircle,
  FiSend,
  FiSettings,
  FiSmile,
  FiUpload,
  FiXCircle,
} from "solid-icons/fi";

import { AiOutlineStop } from "solid-icons/ai";

// Revolt Client
import { revolt as client } from "./lib/revolt";
import classNames from "classnames";

// Import signals and stores
import * as Solenoid from "./lib/solenoid";
import Userbar from "./components/ui/navigation/Userbar";
import Settings from "./components/ui/settings";
import Navigation from "./components/ui/navigation/navbar/servers";
import ChannelNavigation from "./components/ui/navigation/navbar/channels";

// Way to know if user notifications are enabled
let notification_access: boolean;

// Functions
const onImageChange = (e: any) => {
  Solenoid.setImages([...e.target.files]);
};
const onAvatarChange = (
  e: Event & { currentTarget: HTMLInputElement; target: Element }
) => {
  if (e.currentTarget.files) Solenoid.setAvatarImage(e.currentTarget.files);
};

// Setup
client.on("ready", async () => {
  Solenoid.setLoggedIn(true);
  Solenoid.setUser("username", client.user?.username);
  Solenoid.setUser("user_id", client.user?._id);
  if (Solenoid.settings.debug && Solenoid.settings.session_type === "token") {
    console.info(`Logged In as ${client.user?.username} (Bot Mode)`);
  } else if (
    Solenoid.settings.debug &&
    Solenoid.settings.session_type === "email"
  ) {
    console.info(`Logged In as ${client.user?.username}`);
  }
});

// Update Status Automatically
client.on("packet", async (info) => {
  if (info.type === "UserUpdate" && info.id === client.user?._id) {
    Solenoid.setSettings("status", info.data.status?.presence);
    Solenoid.setSettings("statusText", info.data.status?.text);
  }
});

// Logout from current session and reset server properties
function logoutFromRevolt() {
  Solenoid.setLoggedIn(false);
  Solenoid.setSettings("session", undefined);
  Solenoid.setUser("user_id", undefined);
  Solenoid.setUser("username", undefined);
  Solenoid.setUser("session_type", undefined);
  Solenoid.setServers("current_channel", undefined);
  Solenoid.setServers("current_server", undefined);
  Solenoid.setServers("current_server_channels", undefined);
  Solenoid.setServers("isHome", false);
  Solenoid.setServers("server_list", undefined);
  Solenoid.setSettings("show", false);
  if (client.session) client.logout();
}

// Get Messages from current selected channel
async function getMessagesFromChannel() {
  await Solenoid.servers.current_channel
    ?.fetchMessagesWithUsers()
    .then(({ messages }) =>
      Solenoid.setServers("messages", messages.reverse())
    );
  Solenoid.setServers("isHome", false);
}

// Image Attaching
createEffect(() => {
  const newImageUrls: any[] = [];
  Solenoid.images()?.forEach((image) =>
    newImageUrls.push(URL.createObjectURL(image))
  );
  Solenoid.setImgUrls(newImageUrls);
});

// Upload image to autumn.revolt.chat
async function uploadFile(
  autummURL: string,
  tag: string,
  file: File,
  config?: AxiosRequestConfig
) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await Axios.post(`${autummURL}/${tag}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...config,
  });

  return res.data.id;
}

function deleteMessage(message: Message) {
  message.delete();
}

// Send message with file
async function sendFile(content: string) {
  const attachments: string[] = [];

  const cancel = Axios.CancelToken.source();
  const files: any | undefined = Solenoid.images();

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      attachments.push(
        await uploadFile(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          client.configuration!.features.autumn.url,
          "attachments",
          file,
          {
            cancelToken: cancel.token,
          }
        )
      );
      if (Solenoid.settings.debug) console.log(attachments);
    }
  } catch (e) {
    if ((e as any)?.message === "cancel") {
      return;
    } else {
      if (Solenoid.settings.debug) console.log((e as any).message);
    }
  }

  const nonce = ulid();

  try {
    await Solenoid.servers.current_channel?.sendMessage({
      content,
      nonce,
      attachments,
      replies: Solenoid.replies(),
    });
  } catch (e: unknown) {
    if (Solenoid.settings.debug) console.log((e as any).message);
  }
}

// Send Message Handler
async function sendMessage(message: string) {
  const nonce = ulid();
  if (Solenoid.servers.current_channel) {
    if (Solenoid.images()) {
      await sendFile(message);
    } else if (Solenoid.replies()) {
      Solenoid.servers.current_channel?.sendMessage({
        content: message,
        replies: Solenoid.replies(),
        nonce,
      });
    } else {
      Solenoid.servers.current_channel?.sendMessage({
        content: message,
        nonce,
      });
    }
  }
  Solenoid.setNewMessage("");
  Solenoid.setReplies([]);
  Solenoid.setImages(undefined);
  Solenoid.setShowPicker(false);
}

// Channel Switching
function setChannel(channel_id: string) {
  Solenoid.setServers(
    "current_channel",
    Solenoid.servers.current_server_channels?.find((channel) => {
      if (channel) return channel["_id"] === channel_id;
    })
  );
  getMessagesFromChannel();
  if (Solenoid.settings.debug) console.log(Solenoid.servers.current_channel);
}
// Fetch Channels from Server
function fetchChannels() {
  Solenoid.setServers(
    "current_server_channels",
    Solenoid.servers.current_server?.channels
  );
  if (Solenoid.settings.debug)
    console.log(Solenoid.servers.current_server_channels);
}
// Server Switching
function setServer(server_id: string) {
  Solenoid.setServers(
    "current_server",
    Solenoid.servers.server_list?.find((server) => server["_id"] === server_id)
  );
  fetchChannels();
  if (Solenoid.settings.debug) console.log(Solenoid.servers.current_server);
}
// Get Current Status from API
async function getStatus() {
  const userinfo = await client.api.get("/users/@me");
  Solenoid.setSettings("statusText", userinfo.status?.text);
  Solenoid.setSettings("status", userinfo.status?.presence);
}

// Show Settings Centre
function showSettings() {
  // Update current status to show properly and don't show undefined on a button
  getStatus();
  Solenoid.setSettings("show", Solenoid.settings.show ? false : true);
}

// Set settings
function setCurrentSettings() {
  if (Solenoid.settings.newShowSuffix === true) {
    Solenoid.setSettings("showSuffix", true);
  } else if (Solenoid.settings.newShowSuffix === false) {
    Solenoid.setSettings("showSuffix", false);
  }

  updateStatus();
  Solenoid.setServers("messages", []);
  getMessagesFromChannel();
}

// Update status
function updateStatus(
  mode?: "Online" | "Focus" | "Idle" | "Busy" | "Invisible" | null | undefined,
  status?: string
) {
  if (mode && status) {
    client.api.patch("/users/@me", {
      status: {
        presence: mode,
        text: status,
      },
    });
  } else {
    client.api.patch("/users/@me", {
      status: {
        presence: Solenoid.settings.status || client.user?.status?.presence,
        text: Solenoid.settings.statusText,
      },
    });
  }
}

// AutoLogin
async function loginWithSession(session: unknown & { action: "LOGIN" }) {
  try {
    if (Solenoid.usr.session_type === "email" && session) {
      await client.useExistingSession(session).catch((e) => {
        throw e;
      });
      Solenoid.setSettings("session_type", "email");
      Solenoid.setSettings("session", session);
      Solenoid.setLoggedIn(true);
    } else {
      return;
    }
  } catch (e) {
    Solenoid.setSettings("session", null);
    Solenoid.setUser("session_type", undefined);
    Solenoid.setUser("user_id", undefined);
    Solenoid.setUser("username", undefined);
  }
}

// Get Role Colour from Message
function getrolecolour(message: Message) {
  if (!message.member) return "#fff";
  for (const [, { colour }] of message.member.orderedRoles) {
    if (Solenoid.settings.debug) console.log(colour);
    if (colour) {
      return colour;
    }
  }
}

// Send Notifications
client.on("message", (msg) => {
  if ((Solenoid.servers.current_channel && Solenoid.servers.messages) && (Solenoid.servers.current_channel._id === msg.channel?._id)) {
    Solenoid.setServers(produce((store) => store.messages?.push(msg)));
  }
});

function stopTyping() {
  if (!Solenoid.settings.experiments.disappear)
    client.websocket.send({
      type: "EndTyping",
      channel: Solenoid.servers.current_channel?._id,
    });
}

function startTyping() {
  if (!Solenoid.settings.experiments.disappear)
    client.websocket.send({
      type: "BeginTyping",
      channel: Solenoid.servers.current_channel?._id,
    });
}

const debouncedStopTyping = createMemo(
  debounce(stopTyping as (...args: unknown[]) => void, 1000)
);

client.on("message/delete", async (id) => {
  Solenoid.setServers("messages", produce(messages => messages?.filter((e) => id == e._id)));
});

client.on("message/updated", async (message) => {
  const index = Solenoid.servers.messages?.findIndex(o => o._id === message._id);
  Solenoid.setServers("messages", produce(messages => messages?.splice(index || 0, 1, message)));
  console.log(index)
})

// Mobx magic (Thanks Insert :D)
let id = 0;
enableExternalSource((fn, trigger) => {
  const reaction: any = new Reaction(`externalSource@${++id}`, trigger);
  return {
    track: (x) => {
      let next;
      reaction.track(() => (next = fn(x)));
      return next;
    },
    dispose: () => reaction.dispose(),
  };
});

// Update ServerList when logged in
setInterval(() => {
  if (Solenoid.loggedIn()) {
    runInAction(() => {
      Solenoid.setServers("server_list", Array.from(client.servers.values()));
    });
  }
}, 2000);

// Automatically log in when session is found and not logged in
if (Solenoid.settings.session && !Solenoid.loggedIn())
  loginWithSession(Solenoid.settings.session);

const App: Component = () => {
  return (
    <div class="flex flex-grow-0 flex-col w-full h-screen">
      <LoginComponent
        client={client}
        userSetter={Solenoid.setUser}
        configSetter={Solenoid.setSettings}
        solenoid_config={Solenoid.settings}
        logged={Solenoid.loggedIn}
        logSetter={Solenoid.setLoggedIn}
      />
      {Solenoid.loggedIn() && (
        <>
          <div class="flex h-full">
            <Navigation />
            <Show when={Solenoid.servers.current_server}>
              <ChannelNavigation />
            </Show>
            <div class="container block w-full overflow-y-scroll">
              {Solenoid.servers.isHome && (
                <div class="home">
                  <h1>Solenoid (Beta)</h1>
                  {window.location.hostname === "localhost" && (
                    <h3>Running on Local Server</h3>
                  )}
                  <p>A lightweight client for revolt.chat made with SolidJS</p>
                  <br />
                  <h3>Contributors</h3>
                  <hr />
                  <p>Insert: Helped me with Mobx and Revolt.js issues</p>
                  <p>
                    RyanSolid:{" "}
                    <a href="https://codesandbox.io/s/mobx-external-source-0vf2l?file=/index.js">
                      This
                    </a>{" "}
                    code snippet
                  </p>
                  <p>
                    VeiledProduct80: Help me realize i forgot the masquerade
                    part
                  </p>
                  <p>
                    Mclnooted: <b>sex</b>
                  </p>
                </div>
              )}
              <div>
                <div>
                  <For each={Solenoid.servers.messages}>
                    {(message) => {
                      if (Solenoid.settings.debug)
                        console.log(message.attachments);
                      if (Solenoid.settings.debug) console.log(message);
                      if (Solenoid.settings.debug)
                        console.log(message.member?.orderedRoles);
                      const colour = getrolecolour(message);
                      return (
                        <MessageComponent
                          client={client}
                          message={message}
                          colour={colour}
                          settings={Solenoid.settings}
                          setter={Solenoid.setReplies}
                          signal={Solenoid.replies}
                          deleteFunction={deleteMessage}
                          textbox={Solenoid.newMessage}
                          setTextbox={Solenoid.setNewMessage}
                        />
                      );
                    }}
                  </For>
                </div>
                {Solenoid.servers.current_channel && <Userbar />}
              </div>
            </div>
          </div>
        </>
      )}
      {Solenoid.settings.show && <Settings />}
    </div>
  );
};

export default App;
