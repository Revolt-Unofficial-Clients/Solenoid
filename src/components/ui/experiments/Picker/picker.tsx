import type { Component, Setter, Accessor } from "solid-js";
import { createSignal } from "solid-js";
import { Message } from "revolt.js";
import EmojiTab from "./tabs/emoji";
import GifTab from "./tabs/gifbox";
import ClassNames from "classnames";

interface props {
  setMessage?: Setter<string> | any;
  message?: Accessor<string> | any;
  type: string;
  messageToReact?: Message;
  setOpen: Setter<boolean>;
}

const [tab, setTab] = createSignal<number>(0);

export const Picker: Component<props> = (props) => {
  return (
    <div class="flex flex-col w-64 h-56">
      <div class="flex flex-row tabs w-full">
          <div
            class={
              ClassNames({
                tab: true,
                "tab-lifted": true,
                "tab-active": tab() === 0
              })
            }
            onClick={() => setTab(0)}
          >
            Emojis
          </div>
          <div
           class={
            ClassNames({
              tab: true,
              "tab-lifted": true,
              "tab-active": tab() === 1
            })
            }
            onClick={() => setTab(1)}
          >
            Gifs
          </div>
      </div>
      
      {tab() === 0 ? (
        <EmojiTab
          setMessage={props.setMessage}
          message={props.message}
          />
      ) : (
        <GifTab
        message={props.message}
        setMessage={props.setMessage}
        tab={tab}
        />
      )}
    </div>
  );
};
