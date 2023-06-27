import { Component, Match, Switch } from "solid-js";
import type { Server } from "revkit";
import { createSignal, For } from "solid-js";
import {
  setServers,
  servers,
  setMessages,
  setSettings,
} from "../../../../lib/solenoid";
import { BiSolidCog } from "solid-icons/bi";
import { useClient } from "../../../providers/client";

const [serverlist, setServerList] = createSignal<Server[]>([]);



const Navigation: Component = () => {

  const client = useClient();

  const showSettingsModal = async () => {
    const userinfo = await client.api.get("/users/@me");
    setSettings("statusText", userinfo.status?.text);
    setSettings("status", userinfo.status?.presence);
    setSettings("show", true);
  }
  const goHome = () => {
    setServers("current_server", undefined);
    setServers("current_channel", undefined);
    setMessages([]);
    setServers("isHome", true);
  };

  const setServer = (server: Server) => {
    setServers("current_server", server);

    // Go to the first found channel
    setServers("current_channel", undefined);
    setServers("isHome", false);
  };

  setServerList(client.servers.items());
  return (
    <div class="flex flex-col shrink-0 h-screen bg-base-300 overflow-y-scroll">
      <div class="indicator m-4 self-center">
        <span
          class="indicator-item badge w-2"
          classList={{
            "badge-success": client.user.presence === "Online",
            "badge-info": client.user.presence === "Focus",
            "badge-warning": client.user.presence === "Idle",
            "badge-content": client.user.presence === "Invisible",
          }}
        />
        <button
          onClick={goHome}
          class="grid place-items-center avatar self-center"
        >
          <div
            class="w-12 rounded-full"
            classList={{
              "ring ring-primary ring-offset-base-100 ring-offset-2":
                servers.isHome,
            }}
          >
            <img src={client.user.generateAvatarURL({ max_side: 256 })} />
          </div>
        </button>
      </div>
      <For each={serverlist()}>
        {(server) => (
          <button
            class="my-2 mx-4 self-center"
            onClick={() => {
              setServer(server);
            }}
          >
            <Switch>
              <Match when={server.icon}>
                <div class="avatar">
                  <div
                    class="w-12 rounded-full"
                    classList={{
                      "ring ring-offset-base-100 ring-offset-2":
                        servers.current_server?.id === server.id,
                    }}
                  >
                    <img src={server.generateIconURL()} />
                  </div>
                </div>
              </Match>
              <Match when={!server.icon}>
                <div
                  class="avatar placeholder"
                  onClick={() => {
                    setServer(server);
                  }}
                >
                  <div
                    class="w-12 h-12 bg-neutral-focus font-bold rounded-full"
                    classList={{
                      "ring ring-offset-base-100 ring-offset-2":
                        servers.current_server?.id === server.id,
                    }}
                  >
                    <span>{server.name[0]}</span>
                  </div>
                </div>
              </Match>
            </Switch>
          </button>
        )}
      </For>
      <div
        class="avatar placeholder self-center mb-2 cursor-pointer"
        onClick={showSettingsModal}
      >
        <div class="w-12 h-12 bg-neutral-focus font-bold rounded-full">
          <span>
            <BiSolidCog class="fill-white w-6 h-6" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
