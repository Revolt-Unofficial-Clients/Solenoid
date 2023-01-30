import { Component, For, createResource, createSignal, Show } from "solid-js";

import classNames from "classnames";
import { revolt } from "../../../lib/revolt";
import { revoltUserInfo, setRevoltUserInfo, UserPresence } from "../../../lib/store/solenoidUserStore";
import { solenoidServer } from "../../../lib/store/solenoidServerStore";
import { EMOJI_PACKS, setShowSettingsPanel, setUserSettings, userSettings } from "../../../lib/store/solenoidSettingsStore";
import type { SolenoidSettingsStore } from "../../../lib/store/solenoidSettingsStore";
import { DEFAULT_THEME } from "revolt-toolset";

const [avatar, setAvatar] = createSignal<any>();
const [nickname, setNickname] = createSignal<string>();
const [status, setStatus] = createSignal<string>();
const [presence, setPresence] = createSignal<UserPresence>();

const onAvatarChange = (
  e: Event & { currentTarget: HTMLInputElement; target: Element }
) => {
  if (e.currentTarget.files) setAvatar(e.currentTarget.files);
};

function updateStatus() {
  revolt.api.patch("/users/@me", {
    status: {
      presence: presence() || revolt.user?.presence,
      text: status() || revolt.user?.status,
    },
  });
}

function logoutFromRevolt() {
  revolt.destroy();
}

const [member_avatar_url, set_member_avatar_url] = createSignal<String>()

if (solenoidServer.current) {
  solenoidServer.current.fetchMe().then(me => {
    set_member_avatar_url(me.generateAvatarURL());
    // ^?
  })
}

function setSyncSettings() {
  const settingsFromObject: SolenoidSettingsStore = {
    appearance: {
      theme: userSettings.appearance.theme
    },
    client: {
      developer: {
        debug: userSettings.client.developer.debug
      },
      disableMarkdown: userSettings.client.disableMarkdown,
      emoji: userSettings.client.emoji,
      shouldUseCompactMode: userSettings.client.shouldUseCompactMode,
      showAttachments: userSettings.client.showAttachments,
      showBadges: userSettings.client.showBadges,
      showProfilePictures: userSettings.client.showProfilePictures
    },
    experiments: {
      disableTypingEvent: userSettings.experiments.disableTypingEvent,
      enableChangeIdentity: userSettings.experiments.enableChangeIdentity,
      enableEmojiPicker: userSettings.experiments.enableEmojiPicker,
      enableNewHomescreen: userSettings.experiments.enableNewHomescreen,
      enableServerSettings: userSettings.experiments.enableServerSettings
    },
    user: {
      status: {
        prefabList: userSettings.user.status.prefabList
      }
    }
  }
    revolt.syncSetSettings({["solenoid:settings"]: JSON.stringify(settingsFromObject)}).then(() => {
      console.log(settingsFromObject);
      console.log("Check settings on revite");
    })
}

function getSyncSettings() {
  revolt.syncFetchSettings(["solenoid:settings"]).then((s: any) => {
    const syncedSettings: SolenoidSettingsStore = JSON.parse(s["solenoid:settings"][1])
    console.log(syncedSettings)
    //^?
  })
}

const Settings: Component = () => {
  return (
    <div
      class="absolute z-20 w-full h-full overflow-scroll overflow-x-hidden bg-base-300"
      id="solenoid-settings-panel"
    >
      <div class="transition-all flex bg-base-200 rounded-full w-10 h-10 absolute z-30 top-0 right-0 m-5 hover:scale-125 border-2 border-base-100">
        <button
          class="w-full h-full"
          onClick={() => setShowSettingsPanel(false)}
        >
          X
        </button>
      </div>
      <div
        class="p-3 text-center m-3 bg-base-200 rounded-lg"
        id="solenoid-setting solenoid-revoltusername"
      >
        <div>
          <div>
            <h3>Logged In as {revolt.user?.username}</h3>
          </div>

          <div>
            <img
              src={
                revolt.user?.avatar
                  ? `${revolt.config?.features.autumn.url}/avatars/${revolt.user?.avatar?.id}`
                  : `https://api.revolt.chat/users/${revolt.user?.id}/default_avatar`
              }
              class="block m-3 ml-auto mr-auto rounded-full"
              width={56}
              height={56}
            />
          </div>
        </div>
      </div>

      {/* TODO: Add server username/avatar changing */}
      {solenoidServer.current && userSettings.experiments.enableChangeIdentity && (
        <div class="bg-base-200 m-3 p-3 rounded-lg">
          <form
            class="solenoid-server-username"
            onSubmit={async (e) => {
              console.log("Clicked");
              e.preventDefault();
              if (avatar() && nickname()) {
                revolt.uploadAttachment("profile", avatar(), "avatars").then(id => {
                  solenoidServer.current?.me?.edit({
                    avatar: id,
                    nickname: nickname()
                  })  
                })
              } else if (avatar()) {
                revolt.uploadAttachment("profile", avatar(), "avatars").then(id => {
                  solenoidServer.current?.me?.edit({
                    avatar: id
                  })  
                })
              } else if (nickname()) {
                solenoidServer.current?.me?.edit({
                  nickname: nickname()
                })
              }
            }}
          >
            <div class="item prose" id="1">
              <h3>Server Identity</h3>
              <p class="mt-2">
                Edit how you look in the {solenoidServer.current.name}{" "}
                server
              </p>
            </div>
            <div class="" id="2">
              <label
                for="nick"
                title="Nickname shown to everyone on the server"
                class="label"
              >
                Nickname
              </label>
              <input
                class="input"
                id="nick"
                placeholder={
                  solenoidServer.current.me?.nickname ||
                  revolt.user?.username ||
                  "New Nickname"
                }
                value={nickname() || ""}
                onChange={(e) => setNickname(e.currentTarget.value)}
              />
            </div>
            <div class="item" id="3">
              <h4
                title="Avatar shown to everyone on the server"
                class="mt-2 mb-2"
              >
                Avatar
              </h4>
              <div>
                <img
                  class="rounded-full bg-clip-border w-28 h-28"
                  src={
                    avatar()
                      ? URL.createObjectURL(avatar())
                      :  member_avatar_url() ||
                        revolt.user?.avatar
                      ? `https://autumn.revolt.chat/avatars/${
                          solenoidServer.current.me?.avatar?.id ||
                          revolt.user?.avatar?.id
                        }`
                      : `https://api.revolt.chat/users/${revolt.user?.id}/default_avatar`
                  }
                  width={64}
                  height={64}
                />
              </div>
              <div class="flex mt-3 justify-start content-start">
                <input
                  class="file-input mr-3"
                  type="file"
                  name="avatar-upload"
                  id="avatar-upload"
                  accept="image/png,image/jpeg,image/gif"
                  onChange={(e) => {
                    onAvatarChange(e);
                    console.log(avatar());
                  }}
                />
                <button role="button" class="btn">
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      <div
        class="flex flex-col gap-2 bg-base-200 m-3 p-3 rounded-lg"
        id="solenoid-setting solenoid-status"
      >
        <div class="prose">
          <h3>User Status</h3>
        </div>
        <div>
          <button
            type="button"
            class={classNames({
              btn: true,
              "btn-info": revoltUserInfo.status === "Focus",
              "btn-error": revoltUserInfo.status === "Busy",
              "btn-success": revoltUserInfo.status === "Online",
              "btn-ghost": revoltUserInfo.status === "Invisible",
            })}
            onClick={() => {
              if (revoltUserInfo.status === "Online") {
                setRevoltUserInfo("presence", "Busy");
                updateStatus();
              } else if (revoltUserInfo.status === "Busy") {
                setRevoltUserInfo("presence", "Focus");
                updateStatus();
              } else if (revoltUserInfo.status === "Focus") {
                setRevoltUserInfo("presence", "Invisible");
                updateStatus();
              } else if (revoltUserInfo.status === "Invisible") {
                setRevoltUserInfo("presence", "Online");
                updateStatus();
              }
            }}
          >
            {revoltUserInfo.status}
          </button>
          <input
            type=""
            class="mx-2 input"
            value={status() || ""}
            onChange={(e: any) =>
              setRevoltUserInfo("status", e.currentTarget.value)
            }
          />
        </div>
      </div>
      <div
        class="bg-base-200 m-3 p-3 rounded-lg"
        id="solenoid-setting solenoid-status-list"
      >
        <div class="prose">
          <h3>Status Prefabs</h3>
        </div>
        <p>Some prefabs for quick status changing</p>
        <For each={userSettings.user.status.prefabList}>
          {(prefab) => (
            <div class="flex gap-2">
              <button
                class="btn"
                onClick={() => {
                  revolt.user.update({
                    status: {
                      presence: prefab?.presence,
                      text: prefab?.status
                    }
                  })
                }}
              >
                {prefab?.presence} {"| " && prefab?.status}
              </button>{" "}
              <button
                onClick={() => {
                  setUserSettings("user", "status", "prefabList",
                    userSettings.user.status.prefabList.filter((obj) => obj?.id !== prefab?.id)
                  );
                }}
                class="btn btn-error"
              >
                Remove
              </button>
            </div>
          )}
        </For>
        <h3 class="mt-5 mb-2">Add a prefab</h3>
        <div class="flex gap-2">
          <select
            class="input"
            onChange={(e: any) => setPresence(e.currentTarget.value as UserPresence)}
            value={status() || "Online"}
          >
            <option value="Online">Online</option>
            <option value="Focus">Focus</option>
            <option value="Busy">Busy</option>
            <option value="Idle">Idle</option>
            <option value="Invisible">Invisible</option>
          </select>
          <input
            class="input"
            onChange={(e: any) => setStatus(e.currentTarget.value)}
            value={status() || ""}
            placeholder="Custom Status"
          />
          <button
            class="btn btn-primary"
            onClick={() => {
              setUserSettings("user", "status", "prefabList", [
                ...userSettings.user.status.prefabList,
                {
                  id: userSettings.user.status.prefabList.length,
                  presence: presence() || "Online",
                  status: status(),
                },
              ]);
            }}
          >
            Add Prefab
          </button>
        </div>
      </div>
      <div
        class="bg-base-200 m-3 p-3 rounded-lg"
        id="solenoid-setting solenoid-show-imgs"
      >
        <div class="prose">
          <h3>Attachment Rendering</h3>
        </div>
        <p>
          Whether to show attachments in Solenoid. Disabling attachments may
          save network's bandwidth, useful when mobile data is on.
        </p>
        <input
          type="checkbox"
          class="toggle"
          checked={userSettings.client.showAttachments}
          onChange={() =>
            setUserSettings("client", "showAttachments", !userSettings.client.showAttachments)
          }
        />
      </div>
      <div
        class="bg-base-200 m-3 p-3 rounded-lg"
        id="solenoid-setting solenoid-debug"
      >
        <div class="prose">
          <h3>Debug</h3>
        </div>
        <h4>Enable logging</h4>
        <p>This enables logging some useful information to console.</p>
        <input
          type="checkbox"
          class="toggle"
          checked={userSettings.client.developer.debug}
          onChange={() =>
            setUserSettings("client", "developer", "debug", !userSettings.client.developer.debug)
          }
        />
      </div>
      <div
        class="bg-base-200 m-3 p-3 rounded-lg"
        id="solenoid-setting solenoid-experiments"
      >
        <h2 class="text-center text-xl">Experiments</h2>
        <div class="prose">
          <h3>Emoji Picker</h3>
        </div>
        <div>
          <p>Enable experimental emoji/gif picker.</p>
          <input
            type="checkbox"
            class="toggle"
            checked={userSettings.experiments.enableEmojiPicker}
            onChange={() =>
              setUserSettings("experiments", "enableEmojiPicker", !userSettings.experiments.enableEmojiPicker)
            }
          />
        </div>
        <div class="prose">
          <h3>Edit Server Identity</h3>
        </div>
        <div>
          <p>Enable an Server Identity changer.</p>
          <input
            type="checkbox"
            class="toggle"
            checked={userSettings.experiments.enableServerSettings}
            onChange={() =>
              setUserSettings("experiments", "enableServerSettings", !userSettings.experiments.enableServerSettings)
            }
          />
        </div>
        <div class="prose">
          <h3>Dissapear</h3>
        </div>
        <p>Do not appear on typing indicators</p>
        <input
          type="checkbox"
          class="toggle"
          checked={userSettings.experiments.disableTypingEvent}
          onChange={() =>
            setUserSettings("experiments", "disableTypingEvent", !userSettings.experiments.disableTypingEvent)
          }
        />
        <div class="prose">
          <h3>Emoji Pack</h3>
        </div>
        <div>
          <p>Change how emojis look in Solenoid (You need to reload the channel after changing the pack)</p>
          <select
            title="Options: Fluent 3D, Mutant or Twemoji"
            class="select"
            onChange={(e) =>
              setUserSettings("client", "emoji", e.currentTarget.value as EMOJI_PACKS)
            }
            value={userSettings.client.emoji || EMOJI_PACKS.DEFAULT}
          >
            <option value={EMOJI_PACKS.DEFAULT}>Mutant Remix (By Revolt)</option>
            <option value={EMOJI_PACKS.TWEMOJI}>Twemoji (By Twitter)</option>
            <option value={EMOJI_PACKS.FLUENT}>Fluent 3D (By Microsoft)</option>
          </select>
        </div>
      </div>

      <div class="block ml-auto mr-auto mb-5 prose">
        <button
          class="btn btn-error w-full "
          title={`Log Out from ${revolt.user.username}`}
          aria-role="logout"
          onClick={(e) => {
            e.preventDefault;
            logoutFromRevolt();
          }}
          id="solenoid-logout"
        >
          Log Out
        </button>
      </div>
      <Show when={userSettings.client.developer.debug}>
        <div class="flex gap-2 ml-auto mr-auto mb-5 prose">
          <button
            class="btn btn-warning"
            onClick={setSyncSettings}
          >
            DEBUG: Set Sync Settings
          </button>
          <button
            class="btn btn-warning"
            onClick={getSyncSettings}
          >
            DEBUG: Get Sync Settings
          </button>
        </div>
      </Show>
    </div>
  );
};

export default Settings;
