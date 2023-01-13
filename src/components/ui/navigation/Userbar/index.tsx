import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import * as Solenoid from "../../../../lib/solenoid";
import { ulid } from "ulid";
import Axios from "axios";
import { revolt } from "../../../../lib/revolt";
import { debounce } from "../../../../utils";

import type { AxiosRequestConfig } from "axios";
import type { Component } from "solid-js";
import type { User } from "revolt.js";
import { BiSolidCog, BiSolidFileImage, BiSolidHappy, BiSolidSend } from "solid-icons/bi";
import classNames from "classnames";
import { Picker } from "../../experiments/Picker/picker";

const [sending, setSending] = createSignal<boolean>(false);
const [typing, setTyping] = createSignal<(User | undefined)[]>([]);

const [pickerType, setPickerType] = createSignal<"react" | "emoji">("emoji");
const [showPicker, setShowPicker] = createSignal<boolean>(false);

async function uploadFile(
  autummURL: string,
  tag: string,
  file: File,
  config?: AxiosRequestConfig
) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await Axios.post(`${autummURL}/${tag}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...config,
  });

  return res.data.id;
}

async function sendFile(content: string) {
  const attachments: string[] = [];

  const cancel = Axios.CancelToken.source();
  const files: any | undefined = Solenoid.images();

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      attachments.push(
        await uploadFile(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          revolt.configuration!.features.autumn.url,
          "attachments",
          file,
          {
            cancelToken: cancel.token,
          }
        )
      );
      if (Solenoid.settings.debug) console.log(attachments);
    }
  } catch (e) {
    if ((e as any)?.message === "cancel") {
      return;
    } else {
      if (Solenoid.settings.debug) console.log((e as any).message);
    }
  }

  const nonce = ulid();

  try {
    await Solenoid.servers.current_channel?.sendMessage({
      content,
      nonce,
      attachments,
      replies: Solenoid.replies(),
    });
  } catch (e: unknown) {
    if (Solenoid.settings.debug) console.log((e as any).message);
  }
}

async function sendMessage(message: string) {
  try {
    setSending(true);
    const nonce = ulid();
    if (Solenoid.servers.current_channel) {
      if (Solenoid.images()) {
        await sendFile(message);
      } else if (Solenoid.replies()) {
        Solenoid.servers.current_channel
          ?.sendMessage({
            content: message,
            replies: Solenoid.replies(),
            nonce,
          })
          .catch((e) => {
            throw e;
          });
      } else {
        Solenoid.servers.current_channel
          ?.sendMessage({
            content: message,
            nonce,
          })
          .catch((e) => {
            throw e;
          });
      }
    }
    Solenoid.setNewMessage("");
    Solenoid.setReplies([]);
    Solenoid.setImages(undefined);
    Solenoid.setShowPicker(false);
  } catch (err) {
    console.error("Unexpected error while sending message:", err);
  } finally {
    setSending(false);
  }
}

function stopTyping() {
  if (!Solenoid.settings.experiments.disappear)
    revolt.websocket.send({
      type: "EndTyping",
      channel: Solenoid.servers.current_channel?._id,
    });
}

function startTyping() {
  if (!Solenoid.settings.experiments.disappear)
    revolt.websocket.send({
      type: "BeginTyping",
      channel: Solenoid.servers.current_channel?._id,
    });
}

const debouncedStopTyping = createMemo(
  debounce(stopTyping as (...args: unknown[]) => void, 1000)
);

async function getStatus() {
  const userinfo = await revolt.api.get("/users/@me");
  Solenoid.setSettings("statusText", userinfo.status?.text);
  Solenoid.setSettings("status", userinfo.status?.presence);
}

revolt.on("packet", async (p) => {
  if (
    p.type === "ChannelStartTyping" &&
    p.id === Solenoid.servers.current_channel?._id
  ) {
    setTyping(Solenoid.servers.current_channel!.typing);
  } else if (
    p.type === "ChannelStopTyping" &&
    p.id === Solenoid.servers.current_channel?._id
  ) {
    const filtered = typing().filter((c) => c?._id === p.id);
    setTyping([...filtered]);
  }
});

const Userbar: Component = () => {
  return (
    <div class="sticky bottom-0 left-0 w-full h-full form-control">
      <Show when={typing().length > 0}>
        <div class="flex flex-row items-center gap-2 bg-base-100 relative top-0 left-0 w-full h-10">
          <div class="avatar-group -space-x-6">
            <For each={typing()}>
              {(user) => (
                <div class="avatar">
                  <div class="w-8">
                    <img
                      src={user?.generateAvatarURL() || user?.defaultAvatarURL}
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
              )}
            </For>
          </div>
          <div>
            <Switch>
              <Match when={typing().length === 1}>
                <span>{typing()[0]?.username} is typing...</span>
              </Match>
              <Match when={typing().length === 2}>
                <span>{typing()[0]?.username} and {typing()[1]?.username} are typing...</span>
              </Match>
              <Match when={typing().length === 3}>
                <span>{typing()[0]?.username}, {typing()[1]?.username} and {typing()[2]?.username} are typing...</span>
              </Match>
              <Match when={typing().length > 3}>
                <span>Panic!</span>
              </Match>
            </Switch>
          </div>
        </div>
      </Show>
      <div class="flex input-group">
        <button
          class="btn"
          aria-label="Username"
          onClick={() => {
            if (Solenoid.settings.show) {
              Solenoid.setSettings("show", false);
            } else {
              getStatus();
              Solenoid.setSettings("show", true);
            }
          }}
          title={`Logged in as ${Solenoid.usr.username}, Click for Settings`}
        >
          <BiSolidCog />
        </button>
        <input
          class="w-full input resize-none"
          title="Message"
          aria-role="input"
          placeholder="Message"
          value={Solenoid.newMessage()}
          onChange={(e: any) => {
            Solenoid.setNewMessage(e.currentTarget.value);
          }}
          onInput={() => {
            startTyping();
          }}
          onKeyDown={() => {
            debouncedStopTyping();
          }}
          maxlength={2000}
          autofocus
        />
        {showPicker() && Solenoid.settings.experiments.picker && (
          <Picker
            setMessage={Solenoid.setNewMessage}
            message={Solenoid.newMessage}
            type={pickerType()}
            setOpen={setShowPicker}
          />
        )}
        {Solenoid.settings.experiments.picker && (
          <button class="btn" onClick={() => { showPicker() ? setShowPicker(false) : setShowPicker(true); setPickerType("emoji"); }}>
            <BiSolidHappy />
          </button>
        )
        }
        <input
          class="hidden"
          type="file"
          multiple
          name="upload"
          id="files"
          accept="image/png,image/jpeg,image/gif,video/mp4"
          onChange={(e: any) => Solenoid.setImages([...e.target.files])}
        />
        <label for="files" role="button" class="btn">
          <BiSolidFileImage />
        </label>
        <button
          class={classNames({
            btn: true,
            "btn-disabled": sending(),
          })}
          aria-label="Send"
          disabled={sending()}
          onClick={() => sendMessage(Solenoid.newMessage())}
        >
          <BiSolidSend />
        </button>
      </div>
    </div>
  );
};

export default Userbar;
