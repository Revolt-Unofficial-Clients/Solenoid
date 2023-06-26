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
import ChannelNavigation from "./components/ui/navigation/sidebar/channels";
import Navigation from "./components/ui/navigation/sidebar/servers";
import Userbar from "./components/ui/navigation/Userbar";
import Settings from "./components/ui/settings";
import * as Solenoid from "./lib/solenoid";
import HomePage from "./pages/Home";

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
              <div>
                <Show when={Solenoid.servers.isHome}>
                  <HomePage />
                </Show>
                <Show when={Solenoid.servers.current_channel}>
                  <MessageContainer />
                  <Userbar />
                </Show>
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
