import { Component, Match, Switch } from "solid-js";
import type { Server } from "revolt-toolset";
import { createSignal, For } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { setServers, servers } from "../../../../lib/solenoid";
import classNames from "classnames";
import { BiSolidHome } from "solid-icons/bi"

const [serverlist, setServerList] = createSignal<Server[]>([]);

const Navigation: Component = () => {
  setServerList(revolt.servers.items());
  return (
    <div class="flex flex-col h-screen bg-base-300 px-4">
      <button
        onClick={() => {
          setServers("current_server", undefined);
          setServers("current_channel", undefined);
          setServers("isHome", true);
        }}
        class={classNames({
          btn: true,
          "btn-active": servers.isHome,
          "my-2": true,
          "w-full": true
        })}
      >
        <BiSolidHome />
      </button>
      <For each={serverlist()}>
        {(server) => (
          <button
            class={
              classNames({
                btn: true,
                "btn-active": servers.current_server === server,
                "my-2": true
              })
            }
            onClick={() => {
              setServers("current_server", server);
              setServers("isHome", false);
            }}
          >
            <Switch>
              <Match when={server.icon}>
                <div class="avatar">
                  <div class="w-8 rounded-full">
                    <img src={server.generateIconURL({max_side: 256})} />
                  </div>
                </div>
              </Match>
              <Match when={!server.icon}>
                <div class="avatar placeholder">
                  <div class="bg-neutral-focus text-neutral-content rounded-full w-8">
                    <span class="text-xs">{server.name.substring(0,2)}</span>
                  </div>
                </div>
              </Match>
            </Switch>
          </button>
        )}
      </For>
    </div>
  );
};

export default Navigation;
