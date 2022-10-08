import {
    Component,
    createSignal,
    enableExternalSource,
    For,
    createEffect
} from "solid-js";
import { createStore } from "solid-js/store";
import { Channel, Client, Message, Server} from "revolt.js";
import { Reaction, runInAction } from "mobx";
import HCaptcha from "solid-hcaptcha";
import { createLocalStore, createLocalSignal } from "./utils";
import SolidMarkdown from "solid-markdown";
import Axios from "axios";
import "./styles/main.css";
import { ulid } from "ulid";

import type { AxiosRequestConfig } from "axios";

// Revolt Client
const rvCLient = new Client();

// Interfaces
interface user {
    user_id: string | undefined;
    username: string | undefined;
    session_type: "email" | "token" | undefined;
}

interface loginValues {
    email?: string;
    password?: string;
    token?: string;
    mfa_token?: string;
}

interface server {
    server_list?: Server[] | undefined;
    current_server?: Server | undefined;
    current_server_channels?: any[];
    current_channel?: Channel | undefined;
    messages?: Message[] | undefined;
    isHome: boolean | undefined;
}

interface status {
    id: number,
    mode:
    | "Online"
    | "Focus"
    | "Idle"
    | "Busy"
    | "Invisible"
    | null
    | undefined,
    text: string,
}

interface reply {
    id: string,
    mention: boolean
}

interface settings {
    show: boolean;
    status?:
    | "Online"
    | "Focus"
    | "Idle"
    | "Busy"
    | "Invisible"
    | null
    | undefined;
    statusText?: any;
    showSuffix: boolean;
    newShowSuffix: undefined | boolean;
    suffix: boolean;
    session?: any | undefined;
    session_type?: string | undefined;
    zoomLevel: number;
    showImages: boolean;
    debug: boolean;
}

// Initialize Variables
const [login, setLogin] = createStore<loginValues>({});
const [newMessage, setNewMessage] = createSignal<string>("");
const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
const [captchaToken, setCaptchaToken] = createSignal<string>();
const [user, setUser] = createStore<user>({
    user_id: undefined,
    username: undefined,
    session_type: undefined,
});

const [servers, setServers] = createStore<server>({
    isHome: true,
});

const [messages, setMessages] = createSignal<Message[] | undefined>();
const [replies, setReplies] = createSignal<reply[]>([]);

const [images, setImages] = createSignal<any[] | undefined>(undefined);
const [imgUrls, setImgUrls] = createSignal<any[]>([]);

// Status Prefabs
const [newMode, setNewMode] = createSignal<"Online" | "Idle" | "Focus" | "Busy" | "Invisible" | undefined | null>();
const [newStatus, setNewStatus] = createSignal<string | null>();

// Solenoid Default Settings
const [settings, setSettings] = createLocalStore<settings>("settings", {
    show: false,
    showSuffix: false,
    suffix: false,
    newShowSuffix: undefined,
    zoomLevel: 5,
    session: undefined,
    session_type: undefined,
    showImages: true,
    debug: false,
});

const [statuslist, setStatusList] = createLocalSignal<status[]>("statusList", []);

// Request notification permission
(async () => {
    let permission = await Notification.requestPermission()
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

// Setup
rvCLient.on("ready", async () => {
    setLoggedIn(true);
    setUser("username", rvCLient.user?.username);
    setUser("user_id", rvCLient.user?._id);
    if (settings.debug && settings.session_type === "token") {
        console.info(`Logged In as ${rvCLient.user?.username} (Bot Mode)`)
    } else if (settings.debug && settings.session_type === "email") {
        console.info(`Logged In as ${rvCLient.user?.username}`);
    };
    fetchServers();
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
        await rvCLient.login({
            email: email,
            password: password,
            friendly_name: "Solenoid Client Beta",
            captcha: captchaToken(),
        }).catch((e) => {
            throw e
        }).finally(() => {
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
    await servers.current_channel?.fetchMessagesWithUsers().then(({messages}) => setMessages(messages.reverse()));
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
}

// Channel Switching
function setChannel(channel_id: string) {
    setServers(
        "current_channel",
        servers.current_server_channels?.find(
            (channel) => channel["_id"] === channel_id
        )
    );
    getMessagesFromChannel();
    console.log(servers.current_channel);
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
function updateStatus(mode?: "Online" | "Focus" | "Idle" | "Busy" | "Invisible" | null | undefined, status?: string) {
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
async function loginWithSession(session: any & {action: "LOGIN"}) {
    try {
        await rvCLient.useExistingSession(session);
        setSettings("session_type", "email");
        setSettings("session", session);
        setLoggedIn(true);
    } catch (e) {
        throw e;
    }
}

// Send Notifications
rvCLient.on("message", (msg) => {
    if (Notification.permission) {
        if (msg.mentions?.some(e => {
            if (e?._id === rvCLient.user?._id) {
                console.log(true);
                return true
            } else {
                    console.log(false);
                    return false
                };
        })) {
        const notification = new Notification(`${msg.author?.username} mentioned you:`, {
            body: `${msg.content}`
        })
    }

    }
})

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

if (settings.session && !loggedIn()) loginWithSession(settings.session);


const App: Component = () => {
    return (
        <div>
            {window.location.hostname === "localhost" && (
                <div class="solenoid-utils-local banner">
                    <span>
                        Running on a local server, some features might not be available.
                    </span>
                </div>
            )}
            {!loggedIn() && (
                <div class="solenoid-login">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            logIntoRevolt(login.token ?? "");
                        }}
                    >
                        <div class="token">
                            <label id="subtitle">Login with Token</label>
                            <input
                                id="token"
                                type="text"
                                class="textarea"
                                placeholder="Token"
                                value={login.token || ""}
                                onInput={(e: any) => onInputChange(e, "token")}
                            ></input>
                            <button id="submit" type="submit">
                                Login
                            </button>
                        </div>
                    </form>
                    {window.location.hostname !== "localhost" && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                loginWithEmail(login.email ?? "", login.password ?? "");
                            }}
                        >
                            <div>
                                <label id="subtitle">Login with Email</label>
                                <input
                                    class="textarea"
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={login.email || ""}
                                    onInput={(e: any) => onInputChange(e, "email")}
                                ></input>
                                <input
                                    class="textarea"
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={login.password || ""}
                                    onInput={(e: any) => onInputChange(e, "password")}
                                ></input>
                                <input
                                    class="textarea"
                                    id="mfa"
                                    type="text"
                                    placeholder="2fa Token (Optional, Not yet implemented)"
                                    value={login.mfa_token || ""}
                                    onInput={(e: any) => onInputChange(e, "mfa_token")}
                                ></input>
                                <HCaptcha
                                    sitekey="3daae85e-09ab-4ff6-9f24-e8f4f335e433"
                                    onVerify={(token) => setCaptchaToken(token)}
                                />
                                <button id="submit" type="submit">
                                    Login
                                </button>
                            </div>
                        </form>
                    )}
                    {settings.session && <button id="existingsession" onClick={() => loginWithSession(settings.session)}>Use Existing Session</button>}
                </div>
            )}
            {loggedIn() && (
                <div class="solenoid">
                    <div class="solenoid-serverList">
                        <div
                            onClick={() => {
                                setServers("current_server", undefined);
                                setServers("current_channel", undefined);
                                setServers("messages", undefined);
                                setServers("isHome", true);
                            }}
                            class="server"
                        >
                            Solenoid Home
                        </div>
                        <For each={servers.server_list}>
                            {(server) => (
                                <div
                                    onClick={() => setServer(server._id)}
                                    class={"server"}
                                >{server.icon &&
                                        <img
                                            src={`${rvCLient.configuration?.features?.autumn?.url}/icons/${server.icon._id}?max-side=256`}
                                            width={32}
                                            height={32}
                                        />
                                    }
                                    <p class="name">{server.name}</p>
                                </div>
                            )}
                        </For>
                    </div>
                    <br />
                    <div class="solenoid-channelList">
                        <For each={servers.current_server_channels}>
                            {(channel) => (
                                <button
                                    id="solenoid-channel"
                                    onClick={() => setChannel(channel._id)}
                                    disabled={
                                        channel._id === servers.current_channel?._id ?? false
                                    }
                                >
                                    {channel.name}
                                </button>
                            )}
                        </For>
                    </div>
                    <div class="solenoid-messages">
                        <For each={messages()}>
                            {(message) => {
                                if (settings.debug) console.log(message.attachments);
                                if (settings.debug) console.log(message);
                                if (settings.debug) console.log();
                                return (
                                    <div
                                        class="solenoid-message"
                                        onClick={() => setReplies([...replies(), {
                                            id: message._id,
                                            mention: false
                                        }])}
                                    >
                                        <div class="solenoid-message-author">
                                        {message.masquerade?.avatar ? (
                                            <img
                                                style={{
                                                    "max-width": "50px",
                                                    "max-height": "50px"
                                                }}
                                                class="solenoid-pfp"
                                                src={message.masquerade?.avatar}
                                            ></img>
                                        ) : message.author?.avatar ? (
                                            <img
                                                style={{
                                                    "max-width": "50px",
                                                    "max-height": "50px"
                                                }}
                                                class="solenoid-pfp"
                                                src={`${rvCLient.configuration?.features?.autumn?.url}/avatars/${message.author?.avatar?._id}`}
                                                title={`${message.author?.avatar?.filename}`}
                                            ></img>
                                        ) : (
                                            <img
                                                style={{
                                                    "max-width": "50px",
                                                    "max-height": "50px"
                                                }}
                                                class="solenoid-pfp"
                                                title="Default Avatar"
                                                src={`https://api.revolt.chat/users/${message.author?._id}/default_avatar`}
                                            ></img>
                                        ) }
                                        <span
                                        class="solenoid-username"
                                        >
                                            {
                                                // TODO Add support for role colors
                                                message.masquerade?.name
                                                ?? message.member?.nickname
                                                ?? message.author?.username
                                                ??"Unknown User"
                                            }
                                        </span>
                                        {message.masquerade && <span class="solenoid-masquerade">(Masquerade)</span>}
                                        {message.author?.bot && <span class="solenoid-bot">(Bot)</span>}
                                        {message.author?._id === "01G1V3VWVQFC8XAKYEPNYHHR2C" && <span class="solenoid-dev">Solenoid Developer 😺</span>}
                                        {message.reply_ids && message.reply_ids.length > 1 ? (
                                            <span class="notimportant"> (Replying to {message?.reply_ids?.length} messages)</span>
                                        ) : (
                                            <For each={message.reply_ids}>
                                                {(r) => {
                                                    const message =
                                                        servers.current_channel?.client.messages.get(r);
                                                    return (
                                                        <span class="notimportant">
                                                            (Replying to {message?.author?.username ?? "Unknown User"})
                                                        </span>
                                                    );
                                                }}
                                            </For>

                                        )}

                                        {settings.suffix && (
                                            <>{settings.showSuffix ? " says " : ":"}</>
                                        )}
                                        </div>
                                        <SolidMarkdown class="solenoid-md" children={message.content ?? undefined} />
                                        <For each={message.attachments}>
                                            {(attachment) => {
                                                if (!settings.showImages) {
                                                    return <></>;
                                                } else if (attachment.metadata.type === "Image") {
                                                    //Basic image support :D
                                                    return (
                                                        <img
                                                            class="solenoid-message-image"
                                                            src={`https://autumn.revolt.chat/attachments/${attachment._id}`}
                                                            width={
                                                                attachment.metadata.width > 500
                                                                    ? attachment.metadata.width /
                                                                    settings.zoomLevel
                                                                    : attachment.metadata.width
                                                            }
                                                            height={
                                                                attachment.metadata.height > 500
                                                                    ? attachment.metadata.height /
                                                                    settings.zoomLevel
                                                                    : attachment.metadata.height
                                                            }
                                                        />
                                                    );
                                                } else if (attachment.metadata.type === "Video") {
                                                    return (
                                                        <video class="solenoid-message-video" src={`${rvCLient.configuration?.features.autumn.url}/attachments/${attachment._id}`} controls />
                                                    )
                                                } else {
                                                    return (
                                                        <div class="solenoid-message-file">
                                                            <h3 class="header">{message.author?.username} sent you a {attachment.metadata.type}</h3>
                                                            <p class="name">File Name: {attachment.filename}</p>
                                                            <a class="download" type="download" href={`${rvCLient.configuration?.features?.autumn?.url}/attachments/${attachment._id}`}>Download</a>
                                                        </div>
                                                    )
                                                }
                                            }}
                                        </For>
                                    </div>
                                );
                            }}
                        </For>
                    </div>
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
                    <div id="solenoid-userBar">
                        <div id="solenoid-misc-buttonList">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(newMessage());
                                }}
                            >
                                <button
                                    id="solenoid-userOptions"
                                    aria-label="Username"
                                    onClick={showSettings}
                                    title={`Logged in as ${user.username}, Click for Settings`}
                                >
                                    {user.username}
                                </button>
                                <textarea
                                    class="solenoid-send-input"
                                    aria-label="Type your message here..."
                                    aria-role="sendmessagebox"
                                    placeholder={
                                        replies().length > 1
                                            ? `Replying to ${replies().length} message${replies().length > 1 ? "s" : ""}`
                                            : replies().length === 1
                                            ? `Replying to ${replies()[0].id}`
                                            : "Type What you Think"
                                    }
                                    value={newMessage()}
                                    onChange={(e: any) => onInputChange(e, "newMessage")}
                                />
                                <button
                                    id="solenoid-send-button"
                                    type="submit"
                                    aria-label="Send Message"
                                    aria-role="sendmessagebutton"
                                >
                                    Send Message
                                </button>
                                <div class="solenoidui-upload">
                                    <div class="solenoid-image-galery">
                                        <For each={imgUrls()}>
                                            {(imageSrc) => (
                                                <img class="solenoid-image-preview" src={imageSrc} />
                                            )}
                                        </For>
                                    </div>
                                    <input
                                        class="solenoid-input-image"
                                        type="file"
                                        multiple
                                        name="upload"
                                        accept="image/png,image/jpeg,image/gif,video/mp4"
                                        onChange={onImageChange}
                                    />
                                </div>
                                {images() && (
                                    <button onClick={() => setImages([])}>
                                        Remove Attachments
                                    </button>
                                )}
                                {replies().length > 0 && (
                                    <button onClick={() => setReplies([])}>
                                        Stop Replying
                                    </button>
                                )}
                            </form>
                        </div>
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
                                <div class="solenoid-setting solenoid-status-list status"><button onClick={() => updateStatus(prefab.mode, prefab.text)}>{prefab.mode} | {prefab.text}</button> <button onClick={() => {
                                    setStatusList(statuslist().filter(obj => obj.id !== prefab.id))
                                }}>Remove</button></div>
                            )}
                        </For>
                        <h3>Add a prefab</h3>
                        <input onChange={(e: any) => setNewMode(e.currentTarget.value)} value={newMode() || ""} placeholder="Mode" />
                        <input onChange={(e: any) => setNewStatus(e.currentTarget.value)} value={newStatus() || ""} placeholder="Custom Status" />
                        <button onClick={() => {
                            setStatusList([...statuslist(), { id: statuslist().length, mode: newMode(), text: newStatus() ?? "" }])
                            console.log(statuslist());
                        }}>Add Prefab</button>
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
                    <div class="solenoid-setting solenoid-update">
                        <button class="solenoid-update-btn" onClick={setCurrentSettings}>
                            Update Settings
                        </button>
                        <button
                            title={`Log Out from ${user.username}`}
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
