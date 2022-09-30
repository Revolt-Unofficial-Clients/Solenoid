import { Component, createSignal, enableExternalSource, For } from 'solid-js';
import { createStore } from 'solid-js/store'
import { Channel, Client, Message, Server } from "revolt.js";
import { Reaction, runInAction } from 'mobx';
import HCaptcha from 'solid-hcaptcha';
import { createLocalStore } from './utils'
import SolidMarkdown from 'solid-markdown';
import "./styles/main.css";

// Revolt Client
const rvCLient = new Client();

// Interfaces
interface user {
    user_id: string | undefined,
    username: string | undefined,
    session_type: "email" | "token" | undefined,

}

interface loginValues {
    email?: string,
    password?: string,
    token?: string,
    mfa_token?: string,
}

interface server {
    server_list?: any[] | undefined,
    current_server?: Server | undefined,
    current_server_channels?: any[],
    current_channel?: Channel | undefined,
    messages?: Message[] | undefined,
    isHome: boolean | undefined,
}

interface settings {
    show: boolean,
    status?: "Online" | "Idle" | "Busy" | "Invisible" | null | undefined,
    statusText?: any,
    showSuffix: boolean,
    newShowSuffix: undefined | boolean,
    suffix: boolean,
    session?: string | undefined,
    zoomLevel: number,
    showImages: boolean,
    debug: boolean
}

// Init Variables
const [login, setLogin] = createStore<loginValues>({})
const [newMessage, setNewMessage] = createSignal<string>("")
const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
const [captchaToken, setCaptchaToken] = createSignal<string>();
const [user, setUser] = createStore<user>({
    user_id: undefined,
    username: undefined,
    session_type: undefined
})

const [servers, setServers] = createStore<server>({
    isHome: true
})

const [reply, setReply] = createSignal<Message>();

// Solenoid Default Settings
const [settings, setSettings] = createLocalStore<settings>("settings", {
    show: false,
    showSuffix: false,
    suffix: false,
    newShowSuffix: undefined,
    zoomLevel: 5,
    showImages: true,
    debug: false
})


// Functions
const onInputChange = (e: InputEvent & { currentTarget: HTMLInputElement, target: HTMLElement }, type: string) => {
    if (type === "email") {
        setLogin("email", e.currentTarget.value)
    } else if (type === "password") {
        setLogin("password", e.currentTarget.value)
    } else if (type === "token") {
        setLogin("token", e.currentTarget.value)
    } else if (type === "mfa_token") {
        setLogin("mfa_token", e.currentTarget.value)
    } else if (type === "newMessage") {
        setNewMessage(e.currentTarget.value)
    } else if (type === "status") {
        setSettings("statusText", e.currentTarget.value)
    } else if (type == "zoom") {
        setSettings("zoomLevel", parseInt(e.currentTarget.value));
    } else {
        throw new Error("Not Valid")
    }
}

rvCLient.on("ready", async () => {
    setLoggedIn(true);
    setUser("username", rvCLient.user?.username)
    setUser("user_id", rvCLient.user?._id)
    if (settings.debug) console.info(`Logged In as ${rvCLient.user?.username} (Bot Mode)`);
    fetchServers();
})

rvCLient.on("packet", async (info) => {
    if (info.type === "UserUpdate" && info.id === rvCLient.user?._id) {
        setSettings("status", info.data.status?.presence);
        setSettings("statusText", info.data.status?.text);
    }
})

async function logIntoRevolt(token: string) {
    try {
        await rvCLient.loginBot(token);
    } catch (e: any) {
        if (settings.debug === true) {
            console.log(e)
        } else {
            alert(e);
        }
    } finally {
        setLoggedIn(true)
        setUser("session_type", "token");
    }
}

async function loginWithEmail(email: string, password: string) {
    try {
        await rvCLient.login({ email: email, password: password, friendly_name: "Solenoid Client Beta", captcha: captchaToken() })
    } catch (e: any) {
        if (settings.debug) {
            console.log(e)
        } else {
            alert(e);
        }
    } finally {
        setLoggedIn(true);
        setUser("session_type", "email");
        setSettings("session", rvCLient.session)
    }
}

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

async function getMessagesFromChannel() {
    setServers("messages", await servers.current_channel?.fetchMessages()?.then((arr) => arr.reverse()))
    setServers("isHome", false);
}

// Send Message Handler
function sendMessage(message: string) {
    if (servers.current_channel) {
        if (reply()) {
            servers.current_channel!.sendMessage({ content: message, replies: [{
                id: reply()?._id || "",
                mention: false
            }]});
        } else {
            servers.current_channel!.sendMessage({ content: message });
        }

    }
    setNewMessage("");
    setReply();
}
// Channel Switching
function setChannel(channel_id: string) {
    setServers("current_channel", servers.current_server_channels?.find((channel) => channel["_id"] === channel_id))
    getMessagesFromChannel();
    console.log(servers.current_channel);
}
// Fetch Channels from Server
function fetchChannels() {
    setServers("current_server_channels", servers.current_server?.channels)
    console.log(servers.current_server_channels);
}
// Server Switching
function setServer(server_id: string) {
    setServers("current_server", servers.server_list?.find((server) => server["_id"] === server_id));
    fetchChannels()
    if (settings.debug) console.log(servers.current_server);
}

async function fetchServers() {
    try {
        setServers("server_list", Array.from(rvCLient.servers.values()))
        if (settings.debug) console.log(servers.server_list)
    } catch (e: any) {
        if (settings.debug) {
            console.log(e)

        } else {
            alert(e);
        }
    }
}

function showSettings() {
    setSettings("show", settings.show ? false : true);
}

function setCurrentSettings() {
    if (settings.newShowSuffix === true) {
        setSettings("showSuffix", true)
    } else if (settings.newShowSuffix === false) {
        setSettings("showSuffix", false)
    }

    updateStatus();
    setServers("messages", undefined);
    getMessagesFromChannel();
}

function updateStatus() {
    rvCLient.api.patch("/users/@me", {
        status: {
            presence: settings.status,
            text: settings.statusText
        }
    })
}

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
        dispose: () => reaction.dispose()
    }
})

// Update ServerList when logged in
setInterval(() => {
    if (loggedIn()) {
        runInAction(() => {
            setServers("server_list", Array.from(rvCLient.servers.values()))
            if (servers.current_channel) {
                getMessagesFromChannel();
            }
        })
    }

}, 1500)

const App: Component = () => {
    return (
        <div>
            {window.location.hostname === "localhost" && (
                <div class="solenoid-utils-local banner">
                    <span>Running on a local server, some features might not be available.</span>
                </div>
            )}
            {!loggedIn() && <div class="solenoid-login">
                <form onSubmit={(e) => { e.preventDefault(); logIntoRevolt(login.token ?? "") }}>
                    <div class="token">
                        <label id="subtitle">Login with Token</label>
                        <input id="token" type="text" class="textarea" placeholder='Token' value={login.token || ""} onInput={(e: any) => onInputChange(e, "token")}></input>
                        <button id="submit" type='submit'>Login</button>
                    </div>
                </form>
                {window.location.hostname !== "localhost" && (
                    <form onSubmit={(e) => { e.preventDefault(); loginWithEmail(login.email ?? "", login.password ?? "") }}>
                        <div>
                            <label id="subtitle">Login with Email</label>
                            <input class="textarea" id="email" type="email" placeholder='Email' value={login.email || ""} onInput={(e: any) => onInputChange(e, "email")}></input>
                            <input class="textarea" id="password" type="password" placeholder='Password' value={login.password || ""} onInput={(e: any) => onInputChange(e, "password")}></input>
                            <input class="textarea" id="mfa" type="text" placeholder='2fa Token (Optional, Not yet implemented)' value={login.mfa_token || ""} onInput={(e: any) => onInputChange(e, "mfa_token")}></input>
                            <HCaptcha sitekey='3daae85e-09ab-4ff6-9f24-e8f4f335e433' onVerify={(token) => setCaptchaToken(token)} />
                            <button id="submit" type='submit'>Login</button>
                        </div>
                    </form>
                )}
            </div>}
            {loggedIn() && (
                <div class="solenoid">
                    <div id="solenoid-serverList">
                        <button onClick={() => { setServers("current_server", undefined); setServers("current_channel", undefined); setServers("messages", undefined); setServers("isHome", true) }} disabled={servers.isHome}>Solenoid Home</button>
                        <For each={servers.server_list}>
                            {(server) => (
                                <button id="solenoid-server" onClick={() => setServer(server._id)} disabled={server._id === servers.current_server?._id ?? false}>{server.name}</button>
                            )}
                        </For>
                    </div>
                    <br />
                    <div class="solenoid-channelList">
                        <For each={servers.current_server_channels}>
                            {(channel) => (
                                <button id="solenoid-channel" onClick={() => setChannel(channel._id)} disabled={channel._id === servers.current_channel?._id ?? false}>{channel.name}</button>
                            )}
                        </For>
                    </div>
                    <ul class="solenoid-messages">
                        <For each={servers.messages}>
                            {(message) => {
                                if (settings.debug) console.log(message.attachments);
                                if (settings.debug) console.log(message);
                                return (
                                    <li class="solenoid-message" onClick={() => setReply(message)}>
                                        {message.masquerade?.name ?? message.author?.username ?? "Unknown User"}
                                        {message.masquerade && " (bridge)"}
                                        <For each={message.reply_ids}>
                                        {(r) => {
                                            const message = servers.current_channel?.client.messages.get(r);
                                            return <span class="solenoid-message notimportant">(Replying to {message?.author?.username})</span>
                                        }}
                                        </For>
                                        { settings.suffix && <>{settings.showSuffix ? " says " : ":"}</>
                                        }
                                        <SolidMarkdown children={message.content ?? undefined} />
                                        <For each={message.attachments}>
                                            {(attachment) => {
                                                if (!settings.showImages) {
                                                    return (<></>);
                                                } else if (attachment.metadata.type === "Image") {
                                                    //Basic image support :D
                                                    return (
                                                        <img
                                                            class="solenoid-message-image"
                                                            src={`https://autumn.revolt.chat/attachments/${attachment._id}`}
                                                            width={attachment.metadata.width > 500 ? attachment.metadata.width / settings.zoomLevel : attachment.metadata.width}
                                                            height={attachment.metadata.height > 500 ? attachment.metadata.height / settings.zoomLevel : attachment.metadata.height}
                                                        />
                                                    )
                                                }
                                            }}
                                        </For>
                                    </li>
                                )
                            }}
                        </For>
                    </ul>
                    {servers.isHome && (
                        <div class="home">
                            <h1>Solenoid (Beta)</h1>
                            {window.location.hostname === "localhost" && <h3>Running on Local Server</h3>}
                            <p>A lightweight client for revolt.chat made with SolidJS</p>
                            <br />
                            <h3>Contributors</h3>
                            <hr />
                            <p>Insert: Helped me with Mobx and Revolt.js issues</p>
                            <p>RyanSolid: <a href='https://codesandbox.io/s/mobx-external-source-0vf2l?file=/index.js'>This</a> code snippet</p>
                            <p>VeiledProduct80: Help me realize i forgot the masquerade part</p>
                            <p>Mclnooted: <b>sex</b></p>
                        </div>
                    )}
                    <div id="solenoid-userBar">
                        <div id="solenoid-misc-buttonList">
                            <form onSubmit={(e) => { e.preventDefault(); sendMessage(newMessage()) }}>
                                <button id="solenoid-userOptions" aria-label="Username" onClick={showSettings} title={`Logged in as ${user.username}, Click for Settings`}>{user.username}</button>
                                <textarea class="solenoid-send-input" aria-label="Type your message here..." aria-role="sendmessagebox" placeholder={reply() ? `Replying to ${reply()?.author?.username}...` :"Type what you think"} value={newMessage()} onChange={(e: any) => onInputChange(e, "newMessage")} />
                                {reply() && <button onClick={() => setReply(undefined)}>Stop Replying</button>}
                                <button id="solenoid-send-button" type="submit" aria-label="Send Message" aria-role="sendmessagebutton">Send Message</button>
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
                        <button onClick={() => {
                            if (settings.newShowSuffix) {
                                setSettings("newShowSuffix", false);
                            } else {
                                setSettings("newShowSuffix", true);
                            }
                        }}>{settings.newShowSuffix ? "Says:" : ":"}</button>
                    </div>
                    <div id="solenoid-setting solenoid-nosuffix">
                        <h3>Toggle Suffix</h3>
                        <p>Whether to show the suffix</p>
                        <button
                            onClick={() => settings.suffix ? setSettings("suffix", false) : setSettings("suffix", true)}
                        >{settings.suffix ? "Yes" : "No"}</button>
                    </div>
                    <div id="solenoid-setting solenoid-status">
                        <h3>Current Status</h3>
                        <button type="button" onClick={() => {
                            if (settings.status === "Online") {
                                setSettings("status", "Busy")
                                updateStatus()
                                console.log(settings.status)
                            } else if (settings.status === "Busy") {
                                setSettings("status", "Invisible")
                                updateStatus()
                            } else if (settings.status === "Invisible") {
                                setSettings("status", "Online")
                                updateStatus()
                            }
                        }}>{settings.status}</button>
                        <input type="text" value={settings.statusText} onChange={(e: any) => onInputChange(e, "status")} />
                    </div>
                    <div id="solenoid-setting solenoid-show-imgs">
                        <h3>Image Rendering</h3>
                        <p>Whether to show images in Solenoid. Affects all images.</p>
                        <button onClick={() => {
                            settings.showImages ? setSettings("showImages", false) : setSettings("showImages", true);
                        }}>{
                                settings.showImages ? "True" : "False"
                            }</button>
                    </div>
                    <div id="solenoid-setting solenoid-img-zoom">
                        <h3>Image Zoom Level</h3>
                        <p>Smaller the number, bigger the image. 0 is original size, Affects all images.</p>
                        <input type="number" value={settings.zoomLevel} onChange={(e: any) => onInputChange(e, "zoom")}></input>
                    </div>
                    <div id="solenoid-setting solenoid-debug">
                        <h3>Debug Mode</h3>
                        <p>Enables Logging and stuff</p>
                        <button onClick={() => settings.debug ? setSettings("debug", false) : setSettings("debug", true)}>{settings.debug ? "Enabled" : "Disabled"}</button>
                    </div>
                    <div class="solenoid-setting solenoid-update">
                        <button class="solenoid-update-btn" onClick={setCurrentSettings}>Update Settings</button>
                        <button title={`Log Out from ${user.username}`} aria-role="logout" onClick={(e) => { e.preventDefault; logoutFromRevolt() }} id="solenoid-logout">Log Out</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
