import { Component, createEffect, createSignal, enableExternalSource, For } from 'solid-js';
import { createStore } from 'solid-js/store'
import { Channel, Client, Message, Server } from "revolt.js";
import { Reaction, runInAction } from 'mobx';
import HCaptcha from 'solid-hcaptcha';
import { createLocalStore } from './utils' 

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
  status: "Online" | "Idle" | "Busy" | "Invisible" | null | undefined,
  statusText: undefined | string,
  showSuffix: boolean,
  newShowSuffix: undefined | boolean,
  session?: string | undefined;
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
const [settings, setSettings] = createLocalStore<settings>("settings", {
  show: false,
  status: "Online",
  statusText: "Using Solenoid Client | solenoid.vercel.app",
  showSuffix: true,
  newShowSuffix: undefined,
})

// Revolt Client
const rvCLient = new Client();

// Functions
const onInputChange= (e: InputEvent & {currentTarget: HTMLInputElement, target: HTMLElement}, type: string) => {
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
  } else {
    throw new Error("Not Valid")
  }
}

rvCLient.on("ready", async () => {
  setLoggedIn(true);
  setUser("username", rvCLient.user?.username)
  setUser("user_id", rvCLient.user?._id)
  console.info(`Logged In as ${rvCLient.user?.username} (Bot Mode)`)
  fetchServers();
})

async function logIntoRevolt(token: string) {
  try {
    await rvCLient.loginBot(token);
} catch (e: any) {
  console.error(e)
} finally {
  setLoggedIn(true)
  setUser("session_type", "token");
}
}

async function loginWithEmail(email: string, password: string) {
  try {
    await rvCLient.login({email: email, password: password, friendly_name: "Solenoid Client Beta", captcha: captchaToken()})
  } catch (e: any) {
    console.error(e)
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
  setServers("messages", await (await servers.current_channel?.fetchMessages())?.reverse())
  setServers("isHome", false);
}

// TODO: Send Message Handler
function sendMessage(message: string) {
  if (servers.current_channel) servers.current_channel!.sendMessage(message);
  setNewMessage("");
}
// TODO: Channel Switching
function setChannel(channel_id: string) {
  setServers("current_channel", servers.current_server_channels?.find((channel) => channel["_id"] === channel_id))
  getMessagesFromChannel();
  console.log(servers.current_channel);
}
// TODO: Fetch Channels from Server
function fetchChannels() {
  setServers("current_server_channels", servers.current_server?.channels)
  console.log(servers.current_server_channels);
}
// TODO: Server Switching
function setServer(server_id: string) {
  setServers("current_server", servers.server_list?.find((server) => server["_id"] === server_id));
  fetchChannels()
  console.log(servers.current_server)
}

async function fetchServers() { try {
  setServers("server_list", Array.from(rvCLient.servers.values()))
  console.log(servers.server_list)
} catch( e: any) {
  console.log(e);
}
}

function showSettings() {
  setSettings("show", settings.show ? false : true);
}

function setCurrentSettings() {
  if (settings.newShowSuffix === true ) {
    setSettings("showSuffix", true)
  } else if (settings.newShowSuffix === false ) {
    setSettings("showSuffix", false)
  }
}

function updateStatus() {
  rvCLient.api.patch("/users/@me", {
    status: {
      presence: settings.status,
      text: settings.statusText
    }
  })
}

// TODO: Automatic Login
if(settings.session) {
  rvCLient.useExistingSession({token: settings.session});
  setLoggedIn(true);
  setUser("username", rvCLient.user?.username);
  setUser("user_id", rvCLient.user?._id);
  setUser("session_type", "email");
  fetchServers();
} else {
  rvCLient.logout();
  setLoggedIn(false);
  setUser("user_id", undefined);
  setUser("username", undefined);
  setUser("session_type", undefined);
  setServers("current_channel", undefined);
  setServers("current_server", undefined);
  setServers("current_server_channels", undefined);
  setServers("isHome", false);
  setServers("server_list", undefined);
  setSettings("show", false);
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
  if(loggedIn()) {
    runInAction(() => {
      setServers("server_list", Array.from(rvCLient.servers.values()))
      if(servers.current_channel) {
        getMessagesFromChannel();
      }
      rvCLient.user?.update({status: {presence: "Online", text:"Logged In from Solenoid Beta | solenoid.vercel.app"}})
    })
  }
  
}, 1000)

const App: Component = () => {
  return (
    <div>
      {!loggedIn() && <>
        <form onSubmit={(e) => {e.preventDefault(); logIntoRevolt(login.token ?? "")}}>
        <div>
          <label>Login with Token</label>
          <input type="text" placeholder='Token' value={login.token || ""} onInput={(e: any) => onInputChange(e, "token")}></input>
          <button type='submit'>Login</button>
        </div>
      </form>
      <form onSubmit={(e) => {e.preventDefault(); loginWithEmail(login.email ?? "", login.password ?? "")}}>
      <div>
          <label>Login with Email</label>
          <input type="email" placeholder='Email' value={login.email || ""} onInput={(e: any) => onInputChange(e, "email")}></input>
          <input type="password" placeholder='Password' value={login.password || ""} onInput={(e: any) => onInputChange(e, "password")}></input>
          <input type="text" placeholder='2fa Token (Optional)' value={login.mfa_token || ""} onInput={(e: any) => onInputChange(e, "mfa_token")}></input>
          <HCaptcha sitekey='3daae85e-09ab-4ff6-9f24-e8f4f335e433' onVerify={(token) => setCaptchaToken(token)} />
          <button type='submit'>Login</button>
        </div>
      </form>
      </>}
      {loggedIn() && (
        <>
        <div id="solenoid-serverList">
          <button onClick={() => {setServers("current_server", undefined); setServers("current_channel", undefined)}} disabled={servers.isHome}>Solenoid Home</button>
          <For each={servers.server_list}>
            {(server) => (
              <button id="solenoid-server" onClick={() => setServer(server._id)} disabled={server._id === servers.current_server?._id ?? false}>{server.name}</button>
            )}
          </For>
        </div>
        <br />
        <div id="solenoid-channelList">
          <For each={servers.current_server_channels}>
            {(channel) => (
              <button id="solenoid-channel" onClick={() => setChannel(channel._id)} disabled={channel._id === servers.current_channel?._id ?? false}>{channel.name}</button>
           )}
          </For>
        </div>
        <ul id="solenoid-messages">
          <For each={servers.messages}>
            {(message) => {
              console.log(message)
              return (<li id="solenoid-message">{message.masquerade?.name?? message.author?.username ?? "Unknown User"}{message.masquerade && " (bridge)"}{settings.showSuffix ? " says" : ":" } {message.content}</li>)
            }}
          </For>
        </ul>
        {servers.isHome && (
          <div>
            <h1>Solenoid (Beta)</h1>
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
            <button aria-label={`Log Out from ${user.username}`} aria-role="logout" onClick={(e) => {e.preventDefault; logoutFromRevolt()}} id="solenoid-logout">Log Out</button>
          </div>
          <form onSubmit={(e) => {e.preventDefault(); sendMessage(newMessage())}}>
            <button id="solenoid-userOptions" aria-label="Username" onClick={showSettings}>{user.username}</button>
            <input id="solenoid-send-input" type="text" aria-label="Type your message here..." aria-role="sendmessagebox" placeholder='Type what you think' value={newMessage()} onChange={(e: any) => onInputChange(e, "newMessage")}></input>
            <button id="solenoid-send-button" type="submit" aria-label="Send Message" aria-role="sendmessagebutton">Send Message</button>
          </form>
        </div>
        </>
      )}
      {settings.show && (
        <div id="solenoid-settings-panel">
          <form onSubmit={(e) => {
            e.preventDefault()
            setCurrentSettings();
            }}>
            <div id="solenoid-setting solenoid-showUsernames">
              <h3>Show Suffix: <button onClick={() => {
                if(settings.newShowSuffix) {
                  setSettings("newShowSuffix", false);
                } else {
                  setSettings("newShowSuffix", true);
                }
              }}>{settings.newShowSuffix ? "Enabled" : "Disabled"}</button></h3>
              <p>current_value: {settings.showSuffix ? "true" : "false"}</p>
            </div>
            <div id="solenoid-setting solenoid-status">
              <h3>Current Status: <button onClick={() => {
                if(settings.status === "Online") {
                  setSettings("status", "Busy")
                  updateStatus()
                  console.log(settings.status)
                } else if (settings.status === "Busy") {
                  setSettings("status", "Invisible")
                  updateStatus()
                } else if(settings.status === "Invisible") {
                  setSettings("status", "Online")
                  updateStatus()
                }
              }}>{settings.status}</button> <input type="text" value={settings.statusText} onChange={(e: any) => onInputChange(e, "status") } /></h3>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;