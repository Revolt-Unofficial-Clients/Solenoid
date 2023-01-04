import { Accessor, Component, Setter } from "solid-js";
import { emojiDictionary } from "../../../../../assets/emoji";
import { For } from "solid-js";

interface props {
  setMessage: Setter<string>;
  message: Accessor<string>;
}

const EmojiTab: Component<props> = (props) => {
  function addToText(s: string) {
    props.setMessage(props.message() + s);
  }
  return (
    <div class="grid grid-cols-4 w-48 h-56 overflow-scroll bg-base-300">
      <For each={Object.entries(emojiDictionary)}>
        {(emoji) => {
          console.log(emoji);
          if (emoji[1].startsWith("custom:")) {
            return (
              <div class="flex w-6 h-6">
                {/* Support for legasy custom emotes */}
                <img
                  src={`https://dl.insrt.uk/projects/revolt/emotes/${emoji[1].substring(
                    7
                  )}`}
                  width={24}
                  height={24}
                  onClick={() => {
                    addToText(`:${emoji[0]}:`);
                  }}
                />
              </div>
            );
          } else {
            return (
              <span
                title={":" + emoji[0] + ":"}
                class="emoji"
                onClick={() => {
                    addToText(`:${emoji[0]}:`);
                }}
              >
                {emoji[1]}
              </span>
            );
          }
        }}
      </For>
    </div>
  );
};

export default EmojiTab;
