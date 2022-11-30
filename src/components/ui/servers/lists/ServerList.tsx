import { For } from "solid-js"
import { client } from "~/libs/revolt"
import { Server } from "revolt.js"
import { setSelectedServer } from ".."

const ServerList = () => {
    const SERVERS = Array.from(client.servers.values());

    return (
        <div class="flex flex-col items-center h-full">
            <For each={SERVERS}>
                {(server: Server) => (
                    <div class="p-2 max-w-fit cursor-pointer" onClick={() => {
                        setSelectedServer(null);
                        setSelectedServer(server)
                        }}>
                        {server.icon ? <img
                            src={`${client.configuration.features.autumn.url}/icons/${server.icon._id}`}
                            width={42}
                            class="rounded-full bg-slate-300 dark:bg-slate-800"
                        /> : <div class="bg-slate-300 dark:bg-slate-600 text-gray-700 dark:text-gray-200 w-8 text-center rounded-full">{server.name.substring(0,2)}</div>}
                    </div>
                )}
            </For>
        </div>
    );
}

export default ServerList;