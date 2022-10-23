import { Component, For, createSignal } from "solid-js";
import type { Server, Client } from "revolt.js";

interface ServerListComponent {
  client: Client;
  setter: any;
}

const [serverlist, setServerList] = createSignal<Server[] | undefined>();

const ServerList: Component<ServerListComponent> = ({
  client,
  setter,
}) => {
  setServerList(Array.from(client.servers.values()));
  return (
    <For each={serverlist()}>
      {(server) => (
        <div onClick={() => setter(server._id)} class={"server"}>
          {server.icon && (
            <img
              src={`${client.configuration?.features?.autumn?.url}/icons/${server.icon._id}?max-side=256`}
              width={32}
              height={32}
            />
          )}
          <p class="name">{server.name}</p>
        </div>
      )}
    </For>
  );
};

export { ServerList };
