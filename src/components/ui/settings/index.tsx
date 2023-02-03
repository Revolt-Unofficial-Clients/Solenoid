import { Component, createSignal, Match, Switch } from "solid-js";
import * as tabs from "./tabs"

// Tabs start at index 0.
// Settings should start at the user profile screen.
const [currentTab, setCurrentTab] = createSignal<number>(0);

const Settings: Component = () => {
  return (
    <div
      class="absolute z-20 w-full h-full overflow-scroll overflow-x-hidden bg-base-300"
      id="solenoid-settings-panel"
    >
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
  );
};

export default Settings;
