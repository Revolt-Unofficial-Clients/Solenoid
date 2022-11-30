import { useNavigate } from "@solidjs/router";
import ServerList from "../servers/lists/ServerList";

import { clearStorage, getFromStorage } from "~/libs/storage/user";
import { client as revolt } from "~/libs/revolt";
import { styled } from "solid-styled-components";

const ServerSidebarBase = styled("div")`
    background-color: ${props => props.theme.background};
    height: 100vh;
    width: fit-content;
    display: flex;
    margin: 0px;
    flex-direction: column;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
`

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
        <ServerSidebarBase>
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
        </ServerSidebarBase>
    );
};

export default ServerSidebar;