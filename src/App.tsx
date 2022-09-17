import { Component, createEffect, createSignal, enableExternalSource, For } from 'solid-js';
import { createStore } from 'solid-js/store'
import { Client } from "revolt.js";
import { Reaction, runInAction } from 'mobx';
import HCaptcha from 'solid-hcaptcha';

// Interfaces
interface user {
  user_id: string | undefined,
  username: string | undefined,
  servers: string[] | undefined,
  messages: string[] | undefined
}

interface loginValues {
  email?: string,
  password?: string,
  token?: string,
  mfa_token?: string,
}

interface server {
  server_list?: any[],
  current_server?: any,
  current_server_channels?: string[],
  current_channel?: string
}

// Init Variables
const [login, setLogin] = createStore<loginValues>({})
const [newMessage, setNewMessage] = createSignal<string>("")
const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
const [captchaToken, setCaptchaToken] = createSignal<string>();
const [user, setUser] = createStore<user>({
  user_id: undefined,
  username: undefined,
  servers: undefined,
  messages: undefined,
})
const [servers, setServers] = createStore<server>({})
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

// Revolt Client
const rvCLient = new Client();

// Update ServerList when logged in
setInterval(() => {
  if(loggedIn()) {
    runInAction(() => {
      setServers("server_list", Array.from(rvCLient.servers.values()))
    })
  }
  
}, 4000)

const App: Component = () => {
  // Event Handlers
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
    setUser("messages", []);
    setUser("username", rvCLient.user?.username)
    setUser("user_id", rvCLient.user?._id)
    console.info(`Logged In ${rvCLient.user?.username}`)
    console.info(`Current Server Configuration:\n${rvCLient.configuration?.features}`);
    fetchServers();
  })

  rvCLient.on("message", async (message) => {
    if(user.messages) if(message) setUser("messages", [...user.messages, `${message?.author?.username} says ${message.content}`])
  })

  async function logIntoRevolt(token?: string | undefined, email?: string | undefined, password?: string | undefined, code?: string | number | undefined) {
    try {
      if(!email || !password) {
      if(!token) return;
      console.log("Logging in with Token...\n", token)
      await rvCLient.loginBot(token);
      console.log(rvCLient.session);
    } else {
      console.log("Logging in with Email...")
      await rvCLient.login({email, password, friendly_name: "Solenoid Client", captcha: captchaToken()});
      console.log(rvCLient.session);
    }
  } catch (e: any) {
    console.error(e)
  } finally {
    console.log(rvCLient.session);
    console.info(rvCLient.configuration);
  }
  }

  function logoutFromRevolt() {
    setLoggedIn(false);
    if (rvCLient.session) rvCLient.logout();
  }

  // TODO: Send Message Handler
  function sendMessage(message: string, channel: string) {
    
  }
  // TODO: Channel Switching
  function setChannel(channel_id: string) {
    
  }
  // TODO: Server Switching
  function setServer(server_id: string) {
    setServers("current_server", servers.server_list?.find((server) => server["_id"] === server_id));
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
  if (rvCLient.session) rvCLient.useExistingSession(rvCLient.session);

  createEffect(() => {
    console.log(user.messages);
  }, [user.messages])

  

  return (
    <div>
      {!loggedIn() && <>
        <form onSubmit={(e) => {e.preventDefault(); logIntoRevolt(login.token)}}>
        <div>
          <label>Login with Token</label>
          <input type="text" placeholder='Token' value={login.token || ""} onInput={(e: any) => onInputChange(e, "token")}></input>
          <button type='submit'>Login</button>
        </div>
      </form>
      <form onSubmit={(e) => {e.preventDefault(); logIntoRevolt(undefined,login.email, login.password)}}>
      <div>
          <label>Login with Email</label>
          <input type="email" placeholder='Email' value={login.email || ""} onInput={(e: any) => onInputChange(e, "email")}></input>
          <input type="password" placeholder='Password' value={login.password || ""} onInput={(e: any) => onInputChange(e, "password")}></input>
          <input type="text" placeholder='2fa Token (Optional)' value={login.mfa_token || ""} onInput={(e: any) => onInputChange(e, "mfa_token")}></input>
          <HCaptcha sitekey='c7110311-d5c6-40a4-b82e-be12b2cff4d6' onVerify={token => setCaptchaToken(token)} />
          <button type='submit'>Login</button>
        </div>
      </form>
      </>}
      {loggedIn() && (
        <>
        <For each={servers.server_list}>
          {(server) => (
            <button onClick={() => setServer(server._id)}>{server.name}</button>
          )}
        </For>
        <ul>
        <For each={user.messages}>
          {(message) => (
            <li>{message}</li>
          )}
        </For>
        </ul>
        <div>
          <form>
            <button aria-label="Username" disabled>{user.username}</button>
            <button aria-label={`Log Out from ${user.username}`} aria-role="logout" onClick={logoutFromRevolt}>Log Out</button>
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