import { Component, For, createSignal } from "solid-js";
import type { Server, Client } from "revolt.js";

interface ServerListComponent {
  client: Client;
  setter: any;
  server_list?: Server[] | undefined;
}

const [serverlist, setServerList] = createSignal<Server[] | undefined>();

const ServerList: Component<ServerListComponent> = ({
  client,
  setter,
  server_list
}) => {
  setServerList(Array.from(client.servers.values()));
  return (
    <For each={server_list || serverlist()}>
      {(server) => (
        <div onClick={() => setter(server._id)} class={"server"}>
          {server.icon ? (
            <img
              src={`${client.configuration?.features?.autumn?.url}/icons/${server.icon._id}?max-side=256`}
              width={32}
              height={32}
            />
          ) : (
            <div class="icon"><span>{server.name.toLocaleUpperCase().substring(0,2)}</span></div>
          )}
        </div>
      )}
    </For>
  );
};

export { ServerList };
