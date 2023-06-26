import { Reaction } from "mobx";
import { Component, createEffect, enableExternalSource, Show } from "solid-js";
import "./styles/main.css";

// Components
import { Login as LoginComponent } from "./components/ui/common/Login";
import { MessageContainer } from "./components/ui/messaging/Message/Container";
// Types

// Revolt Client
import { revolt as client } from "./lib/revolt";

// Import signals and stores
import ChannelNavigation from "./components/ui/navigation/navbar/channels";
import Navigation from "./components/ui/navigation/navbar/servers";
import Userbar from "./components/ui/navigation/Userbar";
import Settings from "./components/ui/settings";
import * as Solenoid from "./lib/solenoid";

// Setup
client.on("ready", async () => {
  Solenoid.setLoggedIn(true);
  Solenoid.setUser("username", client.user?.username);
  Solenoid.setUser("user_id", client.user?.id);
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
  if (info.type === "UserUpdate" && info.id === client.user?.id) {
    Solenoid.setSettings("status", info.data.status?.presence);
    Solenoid.setSettings("statusText", info.data.status?.text);
  }
});

// Image Attaching
createEffect(() => {
  const newImageUrls: any[] = [];
  Solenoid.images()?.forEach((image) =>
    newImageUrls.push(URL.createObjectURL(image))
  );
  Solenoid.setImgUrls(newImageUrls);
});

// AutoLogin
async function loginWithSession(
  session: unknown & { action: "LOGIN"; token: string }
) {
  try {
    if (Solenoid.usr.session_type === "email" && session) {
      await client.login(session.token, "user").catch((e) => {
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
                <MessageContainer />
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
