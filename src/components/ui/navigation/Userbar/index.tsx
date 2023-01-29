import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { ulid } from "ulid";
import Axios from "axios";
import { revolt } from "../../../../lib/revolt";
import { debounce } from "../../../../utils";

import type { AxiosRequestConfig } from "axios";
import type { Component } from "solid-js";
import type { User } from "revolt.js";
import { BiSolidCog, BiSolidFileImage, BiSolidSend } from "solid-icons/bi";
import classNames from "classnames";
import { solenoidServer } from "../../../../lib/store/solenoidServerStore";


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
      <div>
        <input value={message()} onInput={(e) => setMessage(e.currentTarget.value)} placeholder="message"/>
        <button type="button" onClick={send}>Send</button>
      </div>
    )
};

export default Userbar;
