import classNames from "classnames";
import type { Server } from "revolt-toolset";
import { BiSolidHome } from "solid-icons/bi";
import { Component, createSignal, For, Match, Switch } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { setSolenoidServer, solenoidServer } from "../../../../lib/store/solenoidServerStore";
import { setShowSettingsPanel } from "../../../../lib/store/solenoidSettingsStore";

const [serverlist, setServerList] = createSignal<Server[]>([]);

const Navigation: Component = () => {
  setServerList(revolt.servers.items());
  return (
    <div class="flex flex-col h-screen bg-base-300 px-4">
      <button
        onClick={() => {
          setSolenoidServer("current", undefined)
          setSolenoidServer("channel", undefined)
          setSolenoidServer("displayHomescreen", true)
        }}
        class={classNames({
          btn: true,
          "btn-active": solenoidServer.displayHomescreen,
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
                "btn-active": solenoidServer.current === server,
                "my-2": true
              })
            }
            onClick={() => {
              setSolenoidServer("current", server);
              setSolenoidServer("channel", {})
              setSolenoidServer("channel", "list", server.orderedChannels)
              setSolenoidServer("displayHomescreen", false);
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
      <div class="mt-auto" onClick={() => setShowSettingsPanel(true)}>
        S
      </div>
    </div>
  );
};

export default Navigation;
