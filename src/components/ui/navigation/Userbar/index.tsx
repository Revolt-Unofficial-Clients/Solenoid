import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { ulid } from "ulid";
import Axios from "axios";
import { revolt } from "../../../../lib/revolt";
import { debounce } from "../../../../utils";

import type { AxiosRequestConfig } from "axios";
import type { Component } from "solid-js";
import type { User } from "revolt.js";
import { BiSolidCog, BiSolidFileImage, BiSolidSend, BiSolidHappyBeaming } from "solid-icons/bi";
import classNames from "classnames";
import { solenoidServer } from "../../../../lib/store/solenoidServerStore";
import { userSettings } from "../../../../lib/store/solenoidSettingsStore";


const [message, setMessage] = createSignal<string | undefined>();

function send() {
  if (solenoidServer.channel?.current) {
    solenoidServer.channel.current.send({
      content: message()
    })
  }
}

const Userbar: Component = () => {
  return (
      <div class="mt-2 flex w-full sticky bottom-0 z-50 bg-slate-600">
        <input class="w-full p-3" value={message() || ""} onInput={(e) => setMessage(e.currentTarget.value)} placeholder="message"/>
        <Show when={userSettings.experiments.enableEmojiPicker}>
          <button type="button" class="bg-neutral-focus p-3 text-xl">
            <BiSolidHappyBeaming />
          </button>
        </Show>
        <button type="button" class="bg-neutral-focus p-3 text-xl" onClick={send}>
          <BiSolidSend />
        </button>
      </div>
    )
};

export default Userbar;
