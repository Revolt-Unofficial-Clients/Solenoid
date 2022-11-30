import { useNavigate } from "@solidjs/router";
import ServerList from "../servers/lists/ServerList";

import { clearStorage, getFromStorage } from "~/libs/storage/user";
import { client as revolt } from "~/libs/revolt";

const ServerSidebar = () => {
    const navigate = useNavigate();

    const logoutFromRevolt = async () => {
        const CURRENT_SESSION: object = await getFromStorage("session");

        if (!CURRENT_SESSION) {
            revolt.websocket.disconnect();
            navigate("/");
        } else {
            clearStorage("session");
            revolt.logout();
            navigate("/");
        }
    };

    return (
        <div class="bg-slate-200 dark:bg-slate-700 h-screen w-fit m-0 flex flex-col shrink-0 justify-center items-center">
            {/* TODO: Add Direct Message Support */}
            <img class="rounded-full m-2" title={`Logged in as ${revolt.user?.username}`} src={revolt.user?.animatedAvatarURL || revolt.user?.generateAvatarURL() || revolt.user?.defaultAvatarURL} width={42}/>
            <div class="h-1 bg-slate-300 dark:bg-slate-600 w-5 mt-1 mb-1 p-0"/>
            <ServerList />
            {/* FIXME: Use icons instead of text */}
            <button
                class="bottom-0 text-slate-800 dark:text-white p-2"
                disabled
                title="TODO: Settings"
                onClick={() => console.log("Settings Toggle")}
            >
                Settings
            </button>
            <button
                class="bottom-0 text-slate-800 dark:text-white p-2"
                title="FIXME: Login not working after user logout"
                onClick={() => logoutFromRevolt()}
            >
                Logout
            </button>
        </div>
    );
};

export default ServerSidebar;