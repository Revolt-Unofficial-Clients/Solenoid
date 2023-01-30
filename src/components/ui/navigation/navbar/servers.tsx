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
      <div class="flex flex-col gap-3 my-2">
        <div class="avatar" onClick={() => {
          setSolenoidServer("current", null)
          setSolenoidServer("channel", "list", null)
          setSolenoidServer("displayHomescreen", true)
        }}>
          <div class="w-12 h-12 rounded-full">
            <img src={revolt.user.generateAvatarURL()} />
          </div>
        </div>
        <hr />
      </div>
      <div>

      </div>
      <div class="flex flex-col gap-2">
        <For each={serverlist()}>
          {(server) => (
            <Switch>
              <Match when={server.icon}>
                <div class="avatar" onClick={() => {
                  setSolenoidServer("current", server)
                  setSolenoidServer("channel", "list", server.orderedChannels)
                  setSolenoidServer("displayHomescreen", false)
                }}>
                  <div class="w-12 h-12 rounded-full">
                    <img src={server.generateIconURL()} />
                  </div>
                </div>
              </Match>
              <Match when={!server.icon}>
                <div class="avatar placeholder" onClick={() => {
                  setSolenoidServer("current", server)
                  setSolenoidServer("channel", "list", server.orderedChannels)
                  setSolenoidServer("displayHomescreen", false)
                }}>
                  <div class="w-12 h-12 bg-neutral-focus font-bold rounded-full">
                    <span>{server.name[0]}</span>
                  </div>
                </div>
              </Match>
            </Switch>
          )}
        </For>
      </div>
      <div class="mt-auto" onClick={() => setShowSettingsPanel(true)}>
        S
      </div>
    </div>
  );
};

export default Navigation;
