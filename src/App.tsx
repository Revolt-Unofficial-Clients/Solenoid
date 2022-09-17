import { Component, createEffect, createSignal, enableExternalSource, For } from 'solid-js';
import { createStore } from 'solid-js/store'
import { Channel, Client, Message, Server } from "revolt.js";
import { Reaction, runInAction } from 'mobx';
import HCaptcha from 'solid-hcaptcha';

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
  server_list?: any[],
  current_server?: Server,
  current_server_channels?: any[],
  current_channel?: Channel,
  messages?: Message[]
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
const [servers, setServers] = createStore<server>({})

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
  } else {
    throw new Error("Not Valid")
  }
}
rvCLient.on("ready", async () => {
  setLoggedIn(true);
  setUser("username", rvCLient.user?.username)
  setUser("user_id", rvCLient.user?._id)
  console.info(`Logged In as ${rvCLient.user?.username}`)
  fetchServers();
})

async function logIntoRevolt(token: string) {
  try {
    await rvCLient.loginBot(token);
    console.log(rvCLient.configuration?.features.captcha.key);
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
  }
}

function logoutFromRevolt() {
  setLoggedIn(false);
  if (rvCLient.session) rvCLient.logout();
}

async function getMessagesFromChannel() {
  setServers("messages", await servers.current_channel?.fetchMessages())
}

// TODO: Send Message Handler
function sendMessage(message: string) {
  if (servers.current_channel) servers.current_channel!.sendMessage(message);
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

// TODO: Automatic Login
if (rvCLient.session) rvCLient.useExistingSession(rvCLient.session); console.log(rvCLient.session)

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
  
}, 4000)

const App: Component = () => {
  // Event Handlers
  

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
        <div>
          <For each={servers.server_list}>
            {(server) => (
              <button onClick={() => setServer(server._id)}>{server.name}</button>
            )}
          </For>
        </div>
        <div>
          <For each={servers.current_server_channels}>
            {(channel) => (
              <button onClick={() => setChannel(channel._id)}>{channel.name}</button>
           )}
          </For>
        </div>
        <ul>
          <For each={servers.messages}>
            {(message) => {
              console.log(message)
              return (<li>{message.author?.username ?? "Unknown User"} says {message.content}</li>)
            }}
          </For>
        </ul>
        <div>
        <button aria-label={`Log Out from ${user.username}`} aria-role="logout" onClick={(e) => {e.preventDefault; logoutFromRevolt()}}>Log Out</button>
          <form onSubmit={(e) => {e.preventDefault(); sendMessage(newMessage())}}>
            <button aria-label="Username" disabled>{user.username}</button>
            <input type="text" aria-label="Type your message here..." aria-role="sendmessagebox" placeholder='Type what you think' value={newMessage()} onChange={(e: any) => onInputChange(e, "newMessage")}></input>
            <button type="submit" aria-label="Send Message" aria-role="sendmessagebutton">Send Message</button>
          </form>
        </div>
        </>
        
      )}
    </div>
  );
};

export default App;