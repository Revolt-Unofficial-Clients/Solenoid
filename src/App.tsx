import {
  Component,
  createSignal,
  enableExternalSource,
  For,
  createEffect,
  on,
  createMemo,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Client, Message } from "revolt.js";
import { Reaction, runInAction } from "mobx";
import { createLocalStore, createLocalSignal, debounce } from "./utils";
import Axios from "axios";
import "./styles/main.css";
import { ulid } from "ulid";

import { uploadAttachment } from "revolt-toolset";

// Components
import { Message as MessageComponent } from "./components/Message";
import { Login as LoginComponent } from "./components/Login";
import { ServerList } from "./components/ServerList";
import { Picker } from "./components/Picker";
import { ChannelList } from "./components/ChannelList";

// Types
import type { AxiosRequestConfig } from "axios";
import type {
  user,
  loginValues,
  reply,
  server,
  settings as config,
  status,
} from "./types";

// Icons
import {
  FiSmile,
  FiPlusCircle,
  FiSend,
  FiSettings,
  FiXCircle,
  FiUpload,
  FiLogOut,
} from "solid-icons/fi";

import { AiOutlineStop } from 'solid-icons/ai'
import { UserInfo } from "./components/Userbar";

// Revolt Client
const rvCLient = new Client();

// Initialize Variables
const [_login, setLogin] = createStore<loginValues>({});
const [newMessage, setNewMessage] = createSignal<string>("");
const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
const [usr, setUser] = createLocalStore<user>("user_info", {
  user_id: undefined,
  username: undefined,
  session_type: undefined,
});

const [servers, setServers] = createStore<server>({
  isHome: true,
});

const [messages, setMessages] = createSignal<Message[] | undefined>();
const [replies, setReplies] = createSignal<reply[]>([]);

const [images, setImages] = createSignal<any[] | null | undefined>(undefined);
const [imgUrls, setImgUrls] = createSignal<any[] | null | undefined>([]);
const [pickerType, setPickerType] = createSignal<"react" | "emoji">("emoji");
// const [reaction, setReaction] = createSignal<string>();

// Experimental Server side Nickname Switcher
const [avatarImage, setAvatarImage] = createSignal<any>();
const [nickname, setNickname] = createSignal<string>();

// Status Prefabs
const [newMode, setNewMode] = createSignal<
  "Online" | "Idle" | "Focus" | "Busy" | "Invisible" | undefined | null
>();
const [newStatus, setNewStatus] = createSignal<string | null>();

// Solenoid Default Settings
const [settings, setSettings] = createLocalStore<config>("settings", {
  show: false,
  showSuffix: false,
  suffix: false,
  newShowSuffix: undefined,
  zoomLevel: 5,
  session: undefined,
  yiffbox_session: undefined,
  session_type: undefined,
  showImages: true,
  debug: false,
  experiments: {
    picker: false,
    compact: false,
    nick: false,
    edited_format: "default",
    disappear: false
  },
});

const [statuslist, setStatusList] = createLocalSignal<status[]>(
  "statusList",
  []
);
const [captchaKey] = createSignal<string>(
  "3daae85e-09ab-4ff6-9f24-e8f4f335e433"
);
// Experimental Emoji Picker
const [showPicker, setShowPicker] = createSignal<boolean>(false);

// Way to know if user notifications are enabled
let notification_access: boolean;

// Functions
const onInputChange = (
  e: InputEvent & { currentTarget: HTMLInputElement; target: HTMLElement },
  type: string
) => {
  if (type === "email") {
    setLogin("email", e.currentTarget.value);
  } else if (type === "password") {
    setLogin("password", e.currentTarget.value);
  } else if (type === "token") {
    setLogin("token", e.currentTarget.value);
  } else if (type === "mfa_token") {
    setLogin("mfa_token", e.currentTarget.value);
  } else if (type === "newMessage") {
    setNewMessage(e.currentTarget.value);
  } else if (type === "status") {
    setSettings("statusText", e.currentTarget.value);
  } else if (type == "zoom") {
    setSettings("zoomLevel", parseInt(e.currentTarget.value));
  } else {
    throw new Error("Not Valid");
  }
};

const onImageChange = (e: any) => {
  setImages([...e.target.files]);
};
const onAvatarChange = (
  e: Event & { currentTarget: HTMLInputElement; target: Element }
) => {
  if (e.currentTarget.files) setAvatarImage(e.currentTarget.files[0]);
};

// Setup
rvCLient.on("ready", async () => {
  setLoggedIn(true);
  setUser("username", rvCLient.user?.username);
  setUser("user_id", rvCLient.user?._id);
  if (settings.debug && settings.session_type === "token") {
    console.info(`Logged In as ${rvCLient.user?.username} (Bot Mode)`);
  } else if (settings.debug && settings.session_type === "email") {
    console.info(`Logged In as ${rvCLient.user?.username}`);
  }
});

// Update Status Automatically
rvCLient.on("packet", async (info) => {
  if (info.type === "UserUpdate" && info.id === rvCLient.user?._id) {
    setSettings("status", info.data.status?.presence);
    setSettings("statusText", info.data.status?.text);
  }
});

// Logout from current session and reset server properties
function logoutFromRevolt() {
  setLoggedIn(false);
  setSettings("session", undefined);
  setUser("user_id", undefined);
  setUser("username", undefined);
  setUser("session_type", undefined);
  setServers("current_channel", undefined);
  setServers("current_server", undefined);
  setServers("current_server_channels", undefined);
  setServers("isHome", false);
  setServers("server_list", undefined);
  setSettings("show", false);
  if (rvCLient.session) rvCLient.logout();
}

// Get Messages from current selected channel
async function getMessagesFromChannel() {
  await servers.current_channel
    ?.fetchMessagesWithUsers()
    .then(({ messages }) => setMessages(messages.reverse()));
  setServers("isHome", false);
}

// Image Attaching
createEffect(() => {
  const newImageUrls: any[] = [];
  images()?.forEach((image) => newImageUrls.push(URL.createObjectURL(image)));
  setImgUrls(newImageUrls);
}, [images]);

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
  const files: any | undefined = images();

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      attachments.push(
        await uploadFile(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          rvCLient.configuration!.features.autumn.url,
          "attachments",
          file,
          {
            cancelToken: cancel.token,
          }
        )
      );
      if (settings.debug) console.log(attachments);
    }
  } catch (e) {
    if ((e as any)?.message === "cancel") {
      return;
    } else {
      if (settings.debug) console.log((e as any).message);
    }
  }

  const nonce = ulid();

  try {
    await servers.current_channel?.sendMessage({
      content,
      nonce,
      attachments,
      replies: replies()
    });
  } catch (e: unknown) {
    if (settings.debug) console.log((e as any).message);
  }
}

// Send Message Handler
async function sendMessage(message: string) {
  const nonce = ulid();
  if (servers.current_channel) {
    if (images()) {
      await sendFile(message);
    } else if (replies()) {
      servers.current_channel?.sendMessage({
        content: message,
        replies: replies(),
        nonce,
      });
    } else {
      servers.current_channel?.sendMessage({
        content: message,
        nonce,
      });
    }
  }
  setNewMessage("");
  setReplies([]);
  setImages(undefined);
  setShowPicker(false);
}

// Channel Switching
function setChannel(channel_id: string) {
  setServers(
    "current_channel",
    servers.current_server_channels?.find((channel) => {
      if (channel) return channel["_id"] === channel_id;
    })
  );
  getMessagesFromChannel();
  if (settings.debug) console.log(servers.current_channel);
}
// Fetch Channels from Server
function fetchChannels() {
  setServers("current_server_channels", servers.current_server?.channels);
  if (settings.debug) console.log(servers.current_server_channels);
}
// Server Switching
function setServer(server_id: string) {
  setServers(
    "current_server",
    servers.server_list?.find((server) => server["_id"] === server_id)
  );
  fetchChannels();
  if (settings.debug) console.log(servers.current_server);
}
// Get Current Status from API
async function getStatus() {
  const userinfo = await rvCLient.api.get("/users/@me");
  setSettings("statusText", userinfo.status?.text);
  setSettings("status", userinfo.status?.presence);
}

// Show Settings Centre
function showSettings() {
  // Update current status to show properly and don't show undefined on a button
  getStatus();
  setSettings("show", settings.show ? false : true);
}

// Set settings
function setCurrentSettings() {
  if (settings.newShowSuffix === true) {
    setSettings("showSuffix", true);
  } else if (settings.newShowSuffix === false) {
    setSettings("showSuffix", false);
  }

  updateStatus();
  setServers("messages", undefined);
  getMessagesFromChannel();
}

// Update status
function updateStatus(
  mode?: "Online" | "Focus" | "Idle" | "Busy" | "Invisible" | null | undefined,
  status?: string
) {
  if (mode && status) {
    rvCLient.api.patch("/users/@me", {
      status: {
        presence: mode,
        text: status,
      },
    });
  } else {
    rvCLient.api.patch("/users/@me", {
      status: {
        presence: settings.status || rvCLient.user?.status?.presence,
        text: settings.statusText,
      },
    });
  }
}

// AutoLogin
async function loginWithSession(session: unknown & { action: "LOGIN" }) {
  try {
    if (usr.session_type === "email" && session) {
      await rvCLient.useExistingSession(session).catch((e) => {
      throw e;
    });
    setSettings("session_type", "email");
    setSettings("session", session);
    setLoggedIn(true);
    } else {
      return;
    }
  } catch (e) {
    setSettings("session", null);
    setUser("session_type", undefined);
    setUser("user_id", undefined);
    setUser("username", undefined);
  }
}

// Get Role Colour from Message
function getrolecolour(message: Message) {
  if (!message.member) return "#fff";
  for (const [_, { colour }] of message.member.orderedRoles) {
    if (settings.debug) console.log(colour);
    if (colour) {
      return colour;
    }
  }
}

// Send Notifications
rvCLient.on("message", (msg) => {
  if (notification_access) {
    if (
      msg.mentions?.some((e) => {
        if (e?._id === rvCLient.user?._id) {
          console.log(true);
          return true;
        } else {
          console.log(false);
          return false;
        }
      })
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const notification = new Notification(
        `${msg.author?.username} mentioned you:`,
        {
          body: `${msg.content}`,
        }
      );
    }
  }
});

function stopTyping() {
  if (!settings.experiments.disappear) rvCLient.websocket.send({ type: "EndTyping", channel: servers.current_channel?._id})
}

function startTyping() {
  if (!settings.experiments.disappear) rvCLient.websocket.send({ type: "BeginTyping", channel: servers.current_channel?._id})
}

const debouncedStopTyping = createMemo(debounce(stopTyping as (...args: unknown[]) => void, 1000))

rvCLient.on("message/delete", (id) => {
  const newArray = servers.messages?.filter((e) => id == e._id);
  setServers("messages", newArray);
});

// Mobx magic (Thanks Insert :D)
let id = 0;
enableExternalSource((fn, trigger) => {
  const reaction = new Reaction(`externalSource@${++id}`, trigger);
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
  if (loggedIn()) {
    runInAction(() => {
      setServers("server_list", Array.from(rvCLient.servers.values()));
      if (servers.current_channel) {
        getMessagesFromChannel();
      }
    });
  }
}, 2000);



// Automatically log in when session is found and not logged in
if (settings.session && !loggedIn()) loginWithSession(settings.session);

const App: Component = () => {
  return (
    <>
    <LoginComponent
      captchaKey={captchaKey()}
      client={rvCLient}
      configSetter={setSettings}
      logSetter={setLoggedIn}
      logged={loggedIn}
      solenoid_config={settings}
      userSetter={setUser}
      />
      {loggedIn() && <div class="grid">
        <div class="serverbar">
          <ServerList
            client={rvCLient}
            setter={setServer}
            server_list={servers.server_list}
            />
        </div>
        <div class="channelcontainer">
          {servers.current_server && <ChannelList
          channelSetter={setChannel}
          current_channel={servers.current_channel}
          server={servers.current_server}
          />}
        </div>
        <div class="messages">
          <For each={messages()}>
            {(message) => {
              const colour = getrolecolour(message)
            return <MessageComponent client={rvCLient} message={message} colour={colour} deleteFunction={deleteMessage} settings={settings} setter={setReplies} signal={replies} textbox={newMessage} setTextbox={setNewMessage} />}
            }
            </For>
        </div>
        <div class="userbar">
          <UserInfo client={rvCLient} />
        </div>
        {images() && <div class="attachmentbar"></div>}
        <div class="textbox">{
          servers.current_channel && 
          <>
            <div class="typing-indicator">
             <For each={servers.current_channel?.typing.filter(
                (x) =>
                  typeof x !== "undefined" &&
                  x._id !== x.client.user!._id &&
                  x.relationship !== "Blocked",
              )}>{
                (user) => {
                  return <img width={32} height={32} src={user?.generateAvatarURL({max_side: 256})}/>
                }
              }</For> 
              <span>{() => {
              const users = servers.current_channel?.typing.filter(
                (x) =>
                  typeof x !== "undefined" &&
                  x._id !== x.client.user!._id &&
                  x.relationship !== "Blocked",
              );

              if ( users && users.length > 0) {
                users!.sort((a, b) =>
                    a!._id.toUpperCase().localeCompare(b!._id.toUpperCase()),
                );
        
                if (users.length >= 5) {
                    return "Many people are talking..."
                } else if (users.length > 1) {
                    const userlist = [...users].map((x) => x!.username);
                    const user = userlist.pop();
        
                    return (
                       `${user}, ${userlist.join(", ")} are typing...`
                    );
                } else {
                    return `${users[0]?.username} is typing...`
                }

              }}}</span></div>
              <div class="tb">
                <div role="button"><FiUpload/></div>
                <textarea value={newMessage() || ""} onChange={(e) => setNewMessage(e.currentTarget.value)} />
                <div role="button" onClick={() => sendMessage(newMessage())}><span>Send</span></div>
              </div>
          </>
        }</div>
      </div>}
    </>
  );
};

export default App;
