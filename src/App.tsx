import Axios from "axios";
import { Reaction, runInAction } from "mobx";
import {
  batch,
  Component,
  createEffect, enableExternalSource,
  For,
  Show
} from "solid-js";
import { produce } from "solid-js/store";
import { ulid } from "ulid";
import "./styles/main.css";

// Components
import { Login as LoginComponent } from "./components/ui/common/Login";
import { MessageContainer } from "./components/ui/messaging/Message/Container";
// Types
import type { AxiosRequestConfig } from "axios";

// Revolt Client
import { revolt as client } from "./lib/revolt";

// Import signals and stores
import ChannelNavigation from "./components/ui/navigation/navbar/channels";
import Navigation from "./components/ui/navigation/navbar/servers";
import Userbar from "./components/ui/navigation/Userbar";
import Settings from "./components/ui/settings";
import { revoltUserInfo, setRevoltUserInfo } from "./lib/store/solenoidUserStore";
import { solenoidServer } from "./lib/store/solenoidServerStore";
import { showSettingsPanel } from "./lib/store/solenoidSettingsStore";

// Setup
client.on("ready", async () => {
  batch(() => {
    setRevoltUserInfo("isLoggedIn", true);
    setRevoltUserInfo("username", client.user?.username);
    setRevoltUserInfo("status", client.user?.status);
    setRevoltUserInfo("presence", client.user.presence);
  })
});

// Update Status Automatically
client.on("packet", async (info) => {
  if (info.type === "UserUpdate" && info.id === client.user?.id) {
    batch(() => {
      setRevoltUserInfo("status", info.data.status?.text || undefined)
      setRevoltUserInfo("presence", info.data.status?.presence)
    })
  }
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
      <LoginComponent />
      {revoltUserInfo.isLoggedIn && (
        <>
          <div class="flex h-full">
            <Navigation />
            <Show when={solenoidServer.current}>
              <ChannelNavigation />
            </Show>
            <div class="container block w-full overflow-y-scroll">
              {solenoidServer.displayHomescreen && (
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
                {solenoidServer.channel?.current && <Userbar />}
              </div>
            </div>
          </div>
        </>
      )}
      {showSettingsPanel() && <Settings />}
    </div>
  );
};

export default App;
