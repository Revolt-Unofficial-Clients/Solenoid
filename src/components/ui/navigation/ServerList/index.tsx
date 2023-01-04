import { Component, For, createSignal } from "solid-js";
import type { Server, Client } from "revolt.js";
import classNames from "classnames";

interface ServerListComponent {
  client: Client;
  current: Server | undefined;
  setter: any;
}

const [serverlist, setServerList] = createSignal<Server[] | undefined>();

const ServerList: Component<ServerListComponent> = ({
  client,
  setter,
  current,
}) => {
  setServerList(Array.from(client.servers.values()));
  return (
    <For each={serverlist()}>
      {(server) => (
        <button
          onClick={() => setter(server._id)}
          class={classNames({
            btn: true,
            "btn-active": server!._id === current?._id,
          })}
        >
          {server.icon ? (
            <div class="avatar">
              <div class="w-8 rounded-full">
                <img
                  src={`${client.configuration?.features?.autumn?.url}/icons/${server.icon._id}?max-side=256`}
                  width={32}
                  height={32}
                />
              </div>
            </div>
          ) : (
            <div class="avatar placeholder">
              <div class="bg-neutral-focus text-neutral-content rounded-full w-8">
                <span class="text-xs">
                  {server.name.toUpperCase().substring(0, 2)}
                </span>
              </div>
            </div>
          )}
        </button>
      )}
    </For>
  );
};

export { ServerList };
