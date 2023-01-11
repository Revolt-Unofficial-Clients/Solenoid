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
    <div class="absolute bottom-[50px] right-5 rounded-lg shadow-lg bg-base-100 flex flex-col w-72 h-64 border border-base-300">
      <div class="flex flex-row tab w-full mt-1">
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
