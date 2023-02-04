import classNames from "classnames";
import { BiSolidAdjustAlt, BiSolidCog, BiSolidEdit, BiSolidInfoCircle, BiSolidUserAccount } from "solid-icons/bi";
import { Component, createSignal, Match, Switch, For } from "solid-js";
import { Portal } from "solid-js/web";
import { revolt } from "../../../lib/revolt";
import { setServers, setSettings, settings } from "../../../lib/solenoid";
import * as tabs from "./tabs"

// Tabs start at index 1.
// Settings should start at the user profile screen.
const [currentTab, setCurrentTab] = createSignal<number>(0);

const Settings: Component = () => {
  return (
    <div
      class="absolute z-20 w-full h-full overflow-scroll overflow-x-hidden bg-base-300"
      id="solenoid-settings-panel"
    >
      {/* 
        This sends the x button outside of the component and into the body component
        to make the x button on top of everything.
       */}
      <Portal>
        <button
          onClick={() => {
            setSettings("show", false);
          }}
          class="absolute top-5 right-5 z-50 flex items-center justify-center border-2 border-base-200 w-10 h-10 text-xl font-bold text-base-10 rounded-full">
          x
        </button>
      </Portal>
      <div class="flex">
        <div class="flex flex-col bg-base-200 w-3/12 h-screen">
          <For each={Object.values(tabs)}>
            {(_, index) => (
              <button
                onClick={() => {
                  setCurrentTab(index)
                }}
                class={`flex items-center gap-1 text-start ${currentTab() === index() ? "bg-accent text-accent-content" : "bg-neutral-focus text-neutral-content"} my-2 mx-2 py-2 rounded-md`}
              >
                <Switch>
                  <Match when={index() === 0}>
                    <BiSolidUserAccount class="ml-1" /> User
                  </Match>
                  <Match when={index() === 1}>
                    <BiSolidEdit class="ml-1" />Identity
                  </Match>
                  <Match when={index() === 2}>
                    <BiSolidCog class="ml-1" />Client
                  </Match>
                  <Match when={index() === 3}>
                    <BiSolidAdjustAlt class="ml-1" /> Experimental
                  </Match>
                  <Match when={index() === 4}>
                    <BiSolidInfoCircle class="ml-1" /> About
                  </Match>
                </Switch>
              </button>
            )}
          </For>
          <button
            onClick={() => {
              revolt.destroy().then(() => {
                setSettings("session", undefined);
                setServers("current_channel", undefined);
                setServers("current_server", undefined);
              })
            }}
          >logout</button>
        </div>
        <div>
          <Switch>
            <Match when={currentTab() === 0}>
              <tabs.userProfileModule />
            </Match>
            <Match when={currentTab() === 1}>
              <tabs.serverIdentityModule />
            </Match>
            <Match when={currentTab() === 2}>
              <tabs.clientModule />
            </Match>
            <Match when={currentTab() === 3}>
              <tabs.experimentsModule />
            </Match>
            <Match when={currentTab() === 4}>
              <tabs.aboutModule />
            </Match>
            <Match when={currentTab() === 5}>
              <div class="text-3xl font-heading font-black">
                Tab not found ;w;
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default Settings;
