import { Component, For } from "solid-js";

import classNames from "classnames";
import { uploadAttachment } from "revolt-toolset";
import { revolt } from "../../../lib/revolt";
import * as Solenoid from "../../../lib/solenoid";

const onAvatarChange = (
  e: Event & { currentTarget: HTMLInputElement; target: Element }
) => {
  if (e.currentTarget.files) Solenoid.setAvatarImage(e.currentTarget.files);
};

function updateStatus(
  mode?: "Online" | "Focus" | "Idle" | "Busy" | "Invisible" | null | undefined,
  status?: string
) {
  if (mode && status) {
    revolt.api.patch("/users/@me", {
      status: {
        presence: mode,
        text: status,
      },
    });
  } else {
    revolt.api.patch("/users/@me", {
      status: {
        presence: Solenoid.settings.status || revolt.user?.status?.presence,
        text: Solenoid.settings.statusText,
      },
    });
  }
}

function logoutFromRevolt() {
  Solenoid.setLoggedIn(false);
  Solenoid.setSettings("session", undefined);
  Solenoid.setUser("user_id", undefined);
  Solenoid.setUser("username", undefined);
  Solenoid.setUser("session_type", undefined);
  Solenoid.setServers("current_channel", undefined);
  Solenoid.setServers("current_server", undefined);
  Solenoid.setServers("current_server_channels", undefined);
  Solenoid.setServers("isHome", false);
  Solenoid.setServers("server_list", undefined);
  Solenoid.setSettings("show", false);
  if (revolt.session) revolt.logout();
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
          onClick={() => Solenoid.setSettings("show", false)}
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
            <h3 class="font-bold">Logged In as {revolt.user?.username}</h3>
          </div>

          <div>
            <img
              src={
                revolt.user?.avatar
                  ? `${revolt.configuration?.features.autumn.url}/avatars/${revolt.user?.avatar?._id}`
                  : `https://api.revolt.chat/users/${revolt.user?._id}/default_avatar`
              }
              class="block m-3 ml-auto mr-auto rounded-full"
              width={56}
              height={56}
            />
          </div>
        </div>
      </div>

      {/* TODO: Add server username/avatar changing */}
      {Solenoid.servers.current_server && Solenoid.settings.experiments.nick && (
        <div class="bg-base-200 m-3 p-3 rounded-lg">
          <form
            class="solenoid-server-username"
            onSubmit={async (e) => {
              console.log("Clicked");
              e.preventDefault();
              const file = await uploadAttachment(
                `solenoid-avatar-${revolt.user?._id}`,
                Solenoid.avatarImage(),
                "avatars"
              );
              console.log(file);
              Solenoid.servers.current_server?.member?.edit({
                avatar:
                  file ||
                  Solenoid.servers.current_server.member.avatar?._id ||
                  null,
                nickname: Solenoid.nickname() || null,
              });
            }}
          >
            <div class="item prose" id="1">
              <h3>Server Identity</h3>
              <p class="mt-2">
                Edit how you look in the {Solenoid.servers.current_server.name}{" "}
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
                  Solenoid.servers.current_server.member?.nickname ||
                  revolt.user?.username ||
                  "New Nickname"
                }
                value={Solenoid.nickname() || ""}
                onChange={(e) => Solenoid.setNickname(e.currentTarget.value)}
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
                    Solenoid.avatarImage()
                      ? URL.createObjectURL(Solenoid.avatarImage())
                      : Solenoid.servers.current_server.member?.avatar ||
                        revolt.user?.avatar
                      ? `https://autumn.revolt.chat/avatars/${
                          Solenoid.servers.current_server.member?.avatar?._id ||
                          revolt.user?.avatar?._id
                        }`
                      : `https://api.revolt.chat/users/${revolt.user?._id}/default_avatar`
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
                    console.log(Solenoid.avatarImage());
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
        class="bg-base-200 m-3 p-3 rounded-lg"
        id="solenoid-setting solenoid-showUsernames"
      >
        <div class="prose">
          <h3>Suffix Style</h3>
        </div>
        <div>
          <p>Change how suffixes look.</p>
          <button
            class="btn mt-5"
            onClick={() => {
              if (Solenoid.settings.newShowSuffix) {
                Solenoid.setSettings("newShowSuffix", false);
              } else {
                Solenoid.setSettings("newShowSuffix", true);
              }
            }}
          >
            {Solenoid.settings.newShowSuffix ? "Says:" : ":"}
          </button>
        </div>
      </div>
      <div
        class="bg-base-200 m-3 p-3 rounded-lg"
        id="solenoid-setting solenoid-nosuffix"
      >
        <div class="prose">
          <h3>Toggle Suffix</h3>
        </div>
        <p>
          Whether to show a suffix after a message. Works better with compact
          mode.
        </p>
        <input
          type="checkbox"
          class="toggle"
          checked={Solenoid.settings.suffix}
          onChange={() =>
            Solenoid.settings.suffix
              ? Solenoid.setSettings("suffix", false)
              : Solenoid.setSettings("suffix", true)
          }
        />
      </div>
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
              "btn-info": Solenoid.settings.status === "Focus",
              "btn-error": Solenoid.settings.status === "Busy",
              "btn-success": Solenoid.settings.status === "Online",
              "btn-ghost": Solenoid.settings.status === "Invisible",
            })}
            onClick={() => {
              if (Solenoid.settings.status === "Online") {
                Solenoid.setSettings("status", "Busy");
                updateStatus();
              } else if (Solenoid.settings.status === "Busy") {
                Solenoid.setSettings("status", "Focus");
                updateStatus();
              } else if (Solenoid.settings.status === "Focus") {
                Solenoid.setSettings("status", "Invisible");
                updateStatus();
              } else if (Solenoid.settings.status === "Invisible") {
                Solenoid.setSettings("status", "Online");
                updateStatus();
              }
            }}
          >
            {Solenoid.settings.status}
          </button>
          <input
            type=""
            class="mx-2 input"
            value={Solenoid.settings.statusText}
            onChange={(e: any) =>
              Solenoid.setSettings("statusText", e.currentTarget.value)
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
        <For each={Solenoid.statuslist()}>
          {(prefab) => (
            <div class="flex gap-2">
              <button
                class="btn"
                onClick={() => updateStatus(prefab.mode, prefab.text)}
              >
                {prefab.mode} | {prefab.text}
              </button>{" "}
              <button
                onClick={() => {
                  Solenoid.setStatusList(
                    Solenoid.statuslist().filter((obj) => obj.id !== prefab.id)
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
            onChange={(e: any) => Solenoid.setNewMode(e.currentTarget.value)}
            value={Solenoid.newMode() || "Online"}
          >
            <option value="Online">Online</option>
            <option value="Focus">Focus</option>
            <option value="Busy">Busy</option>
            <option value="Invisible">Invisible</option>
          </select>
          <input
            class="input"
            onChange={(e: any) => Solenoid.setNewStatus(e.currentTarget.value)}
            value={Solenoid.newStatus() || ""}
            placeholder="Custom Status"
          />
          <button
            class="btn btn-primary"
            onClick={() => {
              Solenoid.setStatusList([
                ...Solenoid.statuslist(),
                {
                  id: Solenoid.statuslist().length,
                  mode: Solenoid.newMode(),
                  text: Solenoid.newStatus() ?? "",
                },
              ]);
              console.log(Solenoid.statuslist());
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
          checked={Solenoid.settings.showImages}
          onChange={() =>
            Solenoid.settings.showImages
              ? Solenoid.setSettings("showImages", false)
              : Solenoid.setSettings("showImages", true)
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
          checked={Solenoid.settings.debug}
          onChange={() =>
            Solenoid.settings.debug
              ? Solenoid.setSettings("debug", false)
              : Solenoid.setSettings("debug", true)
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
            checked={Solenoid.settings.experiments.picker}
            onChange={() =>
              Solenoid.settings.experiments.picker
                ? Solenoid.setSettings("experiments", "picker", false)
                : Solenoid.setSettings("experiments", "picker", true)
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
            checked={Solenoid.settings.experiments.nick}
            onChange={() =>
              Solenoid.settings.experiments.nick
                ? Solenoid.setSettings("experiments", "nick", false)
                : Solenoid.setSettings("experiments", "nick", true)
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
          checked={Solenoid.settings.experiments.disappear}
          onChange={() =>
            Solenoid.settings.experiments.disappear
              ? Solenoid.setSettings("experiments", "disappear", false)
              : Solenoid.setSettings("experiments", "disappear", true)
          }
        />
        <div class="prose">
          <h3>New Home Page</h3>
        </div>
        <p>Enables the new home page</p>
        <input
          type="checkbox"
          class="toggle"
          checked={Solenoid.settings.experiments.newhome}
          onChange={() =>
            Solenoid.settings.experiments.newhome
              ? Solenoid.setSettings("experiments", "newhome", false)
              : Solenoid.setSettings("experiments", "newhome", true)
          }
        />
        <div class="prose">
          <h3>Edit indicator Format</h3>
        </div>
        <div>
          <p>Change how edit indicators show dates.</p>
          <select
            id="indicator"
            title="Options: ISO, UTC or Default"
            class="select"
            onChange={(e) =>
              Solenoid.setSettings(
                "experiments",
                "edited_format",
                e.currentTarget.value
              )
            }
            value={Solenoid.settings.experiments.edited_format || "default"}
          >
            <option value={"ISO"}>ISO Format</option>
            <option value={"UTC"}>UTC Format</option>
            <option value={"default"}>Browser default</option>
          </select>
        </div>
        <div class="prose">
          <h3>Emoji Pack</h3>
        </div>
        <div>
          <p>Change how emojis look in Solenoid (You need to reload the channel after changing the pack)</p>
          <select
            title="Options: Fluent 3D, Mutant or Twemoji"
            class="select"
            onChange={(e) =>
              Solenoid.setSettings(
                "emoji",
                e.currentTarget.value
              )
            }
            value={Solenoid.settings.emoji || "mutant"}
          >
            <option value={"mutant"}>Mutant Remix (By Revolt)</option>
            <option value={"twemoji"}>Twemoji (By Twitter)</option>
            <option value={"fluent-3d"}>Fluent 3D (By Microsoft)</option>
          </select>
        </div>
      </div>

      <div class="block ml-auto mr-auto mb-5 prose">
        <button
          class="btn btn-error w-full "
          title={`Log Out from ${Solenoid.usr.username}`}
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
    </div>
  );
};

export default Settings;
