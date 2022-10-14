import {
  Component,
  createSignal,
  enableExternalSource,
  For,
  createEffect,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Client, Message } from "revolt.js";
import { Reaction, runInAction } from "mobx";
import { createLocalStore, createLocalSignal } from "./utils";
import Axios from "axios";
import "./styles/main.css";
import { ulid } from "ulid";

// Components
import { Message as MessageComponent } from "./components/Message";
import { Login as LoginComponent } from "./components/Login";
import { ServerList } from "./components/ServerList";
import { Picker } from "./components/Picker";
import { ChannelList } from "./components/ChannelList";

import type { AxiosRequestConfig } from "axios";
import type {
  user,
  loginValues,
  reply,
  server,
  settings as config,
  status,
} from "./types";

// Revolt Client
const rvCLient = new Client();

// Initialize Variables
const [login, setLogin] = createStore<loginValues>({});
const [newMessage, setNewMessage] = createSignal<string>("");
const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
const [captchaToken, setCaptchaToken] = createSignal<string>();
const [usr, setUser] = createStore<user>({
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
const [reaction, setReaction] = createSignal<string>();
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
    picker: true,
  },
});

const [statuslist, setStatusList] = createLocalSignal<status[]>(
  "statusList",
  []
);
const [captchaKey, setCaptchaKey] = createSignal<string>(
  "3daae85e-09ab-4ff6-9f24-e8f4f335e433"
);

const [showPicker, setShowPicker] = createSignal<boolean>(false);
// Request notification permission
(async () => {
  let permission = await Notification.requestPermission();
})();

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

// Dealing with Textarea Height
function calcHeight(value: any) {
  let numberOfLineBreaks = (value.match(/\n/g) || []).length;
  // min-height + lines x line-height + padding + border
  let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
  return newHeight;
}

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

// Login With Token and Enable Bot Mode
async function logIntoRevolt(token: string) {
  try {
    await rvCLient.loginBot(token);
  } catch (e: any) {
    if (settings.debug === true) {
      console.log(e);
    } else {
      alert(e);
    }
  } finally {
    setLoggedIn(true);
    setUser("session_type", "token");
    setSettings("session", rvCLient.session);
  }
}

// Login With Email and Password and Enable User Mode
async function loginWithEmail(email: string, password: string) {
  try {
    await rvCLient
      .login({
        email: email,
        password: password,
        friendly_name: "Solenoid Client Beta",
        captcha: captchaToken(),
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        setLoggedIn(true);
        setUser("session_type", "email");
        setSettings("session", rvCLient.session);
      });
  } catch (e: any) {
    if (settings.debug) {
      console.log(e);
    } else {
      alert(e);
    }
  }
}

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
    await servers.current_channel!.sendMessage({
      content,
      nonce,
      attachments,
    });
  } catch (e: any) {
    if (settings.debug) console.log(e.message);
  }
}

// Send Message Handler
async function sendMessage(message: string) {
  const nonce = ulid();
  if (servers.current_channel) {
    if (images()) {
      await sendFile(message);
    } else if (replies()) {
      servers.current_channel!.sendMessage({
        content: message,
        replies: replies(),
        nonce,
      });
    } else {
      servers.current_channel!.sendMessage({
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
    servers.current_server_channels?.find(
      (channel) => channel!["_id"] === channel_id
    )
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

// Fetch joined servers
async function fetchServers() {
  try {
    setServers("server_list", Array.from(rvCLient.servers.values()));
    if (settings.debug) console.log(servers.server_list);
  } catch (e: any) {
    if (settings.debug) {
      console.log(e);
    } else {
      alert(e);
    }
  }
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
async function loginWithSession(session: any & { action: "LOGIN" }) {
  try {
    await rvCLient.useExistingSession(session);
    setSettings("session_type", "email");
    setSettings("session", session);
    setLoggedIn(true);
  } catch (e) {
    throw e;
  }
}

// Get Role Colour from Message
function getrolecolour(message: Message) {
  if (!message.member) return "#fff";
  for (const [_, { colour }] of message.member!.orderedRoles) {
    if (settings.debug) console.log(colour);
    if (colour) {
      return colour;
    }
  }
}

// Send Notifications
rvCLient.on("message", (msg) => {
  if (Notification.permission) {
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
      const notification = new Notification(
        `${msg.author?.username} mentioned you:`,
        {
          body: `${msg.content}`,
        }
      );
    }
  }
});

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
    <div>
      <LoginComponent
        client={rvCLient}
        userSetter={setUser}
        captchaKey={captchaKey()}
        configSetter={setSettings}
        solenoid_config={settings}
        logged={loggedIn}
        logSetter={setLoggedIn}
      />
      {loggedIn() && (
        <div class="solenoid">
          <div class="solenoid-serverList">
            <div
              onClick={() => {
                setServers("current_server", undefined);
                setServers("current_channel", undefined);
                setMessages(undefined);
                setServers("current_server_channels", undefined);
                setServers("isHome", true);
              }}
              class="server"
            >
              Solenoid Home
            </div>
            <ServerList
              client={rvCLient}
              servers={servers.server_list}
              setter={setServer}
            />
          </div>
          {servers.current_server && (
            <ChannelList
              server={servers.current_server}
              channelSetter={setChannel}
            />
          )}
          <div class="solenoid-messages">
            {servers.isHome && (
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
                  VeiledProduct80: Help me realize i forgot the masquerade part
                </p>
                <p>
                  Mclnooted: <b>sex</b>
                </p>
              </div>
            )}
            <For each={messages()}>
              {(message) => {
                if (settings.debug) console.log(message.attachments);
                if (settings.debug) console.log(message);
                if (settings.debug) console.log(message.member?.orderedRoles);
                let colour = getrolecolour(message);
                return (
                  <>
                    <MessageComponent
                      client={rvCLient}
                      message={message}
                      colour={colour}
                      settings={settings}
                      setter={setReplies}
                      signal={replies}
                      deleteFunction={deleteMessage}
                    />
                  </>
                );
              }}
            </For>
          </div>
          {showPicker() && settings.experiments.picker && (
            <Picker
              setMessage={setNewMessage}
              message={newMessage}
              type={pickerType()}
              setOpen={setShowPicker}
            />
          )}
          {imgUrls()!.length > 0 && (
            <div class="solenoid-image-galery">
              <For each={imgUrls()}>
                {(imageSrc) => (
                  <img class="solenoid-image-preview" src={imageSrc} />
                )}
              </For>
            </div>
          )}
          <div class="solenoid-userBar">
            <div
              id="solenoid-userOptions"
              aria-label="Username"
              onClick={showSettings}
              title={`Logged in as ${usr.username}, Click for Settings`}
              role="button"
            >
              config
            </div>
            <textarea
              class="solenoid-send-input"
              title="Type your message here..."
              aria-role="input"
              placeholder={
                replies().length > 1
                  ? `Replying to ${replies().length} message${
                      replies().length > 1 ? "s" : ""
                    }`
                  : replies().length === 1
                  ? `Replying to ${replies()[0].id}`
                  : "Type What you Think"
              }
              value={newMessage()}
              onChange={(e: any) => onInputChange(e, "newMessage")}
              wrap="soft"
              maxlength={2000}
              autofocus
            />
            <div
              class="solenoid-toggle"
              onClick={() => {
                showPicker() ? setShowPicker(false) : setShowPicker(true);
                setPickerType("emoji");
              }}
              role="button"
            >
              <span>😺</span>
            </div>
            <div
              class="solenoid-send-button"
              aria-label="Send"
              onClick={() => sendMessage(newMessage())}
              role="button"
            >
              <span>Send</span>
            </div>
            <input
              class="solenoid-input-image"
              type="file"
              multiple
              name="upload"
              accept="image/png,image/jpeg,image/gif,video/mp4"
              onChange={onImageChange}
            />

            {images() && (
              <div
                onClick={() => {
                  setImages(null);
                  setImgUrls(null);
                }}
                role="button"
              >
                <span>Remove Attachments</span>
              </div>
            )}
            {replies().length > 0 && (
              <div onClick={() => setReplies([])} role="button">
                <span>Stop Replying</span>
              </div>
            )}
          </div>
        </div>
      )}
      {settings.show && (
        <div class="solenoid-settings" id="solenoid-settings-panel">
          <div id="solenoid-setting solenoid-showUsernames">
            <h3>Suffix</h3>
            <p>Whether to add "says:" after a username.</p>
            <button
              onClick={() => {
                if (settings.newShowSuffix) {
                  setSettings("newShowSuffix", false);
                } else {
                  setSettings("newShowSuffix", true);
                }
              }}
            >
              {settings.newShowSuffix ? "Says:" : ":"}
            </button>
          </div>
          <div id="solenoid-setting solenoid-nosuffix">
            <h3>Toggle Suffix</h3>
            <p>Whether to show the suffix</p>
            <button
              onClick={() =>
                settings.suffix
                  ? setSettings("suffix", false)
                  : setSettings("suffix", true)
              }
            >
              {settings.suffix ? "Yes" : "No"}
            </button>
          </div>
          <div id="solenoid-setting solenoid-status">
            <h3>Current Status</h3>
            <button
              type="button"
              onClick={() => {
                if (settings.status === "Online") {
                  setSettings("status", "Busy");
                  updateStatus();
                } else if (settings.status === "Busy") {
                  setSettings("status", "Focus");
                  updateStatus();
                } else if (settings.status === "Focus") {
                  setSettings("status", "Invisible");
                  updateStatus();
                } else if (settings.status === "Invisible") {
                  setSettings("status", "Online");
                  updateStatus();
                }
              }}
            >
              {settings.status}
            </button>
            <input
              type="text"
              value={settings.statusText}
              onChange={(e: any) => onInputChange(e, "status")}
            />
          </div>
          <div id="solenoid-setting solenoid-status-list">
            <h3>Status Prefabs</h3>
            <p>Some prefabs for quick status changing</p>
            <For each={statuslist()}>
              {(prefab) => (
                <div class="solenoid-setting solenoid-status-list status">
                  <button
                    onClick={() => updateStatus(prefab.mode, prefab.text)}
                  >
                    {prefab.mode} | {prefab.text}
                  </button>{" "}
                  <button
                    onClick={() => {
                      setStatusList(
                        statuslist().filter((obj) => obj.id !== prefab.id)
                      );
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </For>
            <h3>Add a prefab</h3>
            <input
              onChange={(e: any) => setNewMode(e.currentTarget.value)}
              value={newMode() || ""}
              placeholder="Mode"
            />
            <input
              onChange={(e: any) => setNewStatus(e.currentTarget.value)}
              value={newStatus() || ""}
              placeholder="Custom Status"
            />
            <button
              onClick={() => {
                setStatusList([
                  ...statuslist(),
                  {
                    id: statuslist().length,
                    mode: newMode(),
                    text: newStatus() ?? "",
                  },
                ]);
                console.log(statuslist());
              }}
            >
              Add Prefab
            </button>
          </div>
          <div id="solenoid-setting solenoid-show-imgs">
            <h3>Image Rendering</h3>
            <p>Whether to show images in Solenoid. Affects all images.</p>
            <button
              onClick={() => {
                settings.showImages
                  ? setSettings("showImages", false)
                  : setSettings("showImages", true);
              }}
            >
              {settings.showImages ? "True" : "False"}
            </button>
          </div>
          <div id="solenoid-setting solenoid-img-zoom">
            <h3>Image Zoom Level</h3>
            <p>
              Smaller the number, bigger the image. 0 is original size, Affects
              all images.
            </p>
            <input
              type="number"
              value={settings.zoomLevel}
              onChange={(e: any) => onInputChange(e, "zoom")}
            ></input>
          </div>
          <div id="solenoid-setting solenoid-debug">
            <h3>Debug Mode</h3>
            <p>Enables Logging and stuff</p>
            <button
              onClick={() =>
                settings.debug
                  ? setSettings("debug", false)
                  : setSettings("debug", true)
              }
            >
              {settings.debug ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div id="solenoid-setting solenoid-experiments">
            <h3>Experiments</h3>
            <h4>Emoji Picker</h4>
            <button
              onClick={() =>
                settings.experiments.picker
                  ? setSettings("experiments", "picker", false)
                  : setSettings("experiments", "picker", true)
              }
            >
              {settings.experiments.picker ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div class="solenoid-setting solenoid-update">
            <button class="solenoid-update-btn" onClick={setCurrentSettings}>
              Update Settings
            </button>
            <button
              title={`Log Out from ${usr.username}`}
              aria-role="logout"
              onClick={(e) => {
                e.preventDefault;
                logoutFromRevolt();
              }}
              id="solenoid-logout"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
