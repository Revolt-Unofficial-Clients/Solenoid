import { styled } from "solid-styled-components";
import { getFromStorage } from "~/libs/storage/user";
import { BiRegularUser, BiRegularIdCard, BiRegularNotification, BiRegularPackage, BiRegularCodeCurly, BiRegularExit, BiRegularInfoCircle, BiRegularX, BiRegularPalette } from "solid-icons/bi";
import { setShowSettings } from "~/routes/client";
import { createSignal, For, Match, Switch } from "solid-js";
import { useNavigate } from "solid-start";
import { clearStorage } from "~/libs/storage/user";
import { client } from "~/libs/revolt";
import { badges } from "~/libs/solenoid";
import { createStore } from "solid-js/store";
import { API } from "revolt.js";
import Showdown from "showdown";

const [newProfile, setNewProfile] = createSignal<string>();

const SidebarBase = styled("div")`
    background-color: ${(props) => props.theme["primary-background"]};
    height: 100vh;
    width: 100%;
    display: flex;
    margin: 0px;
    flex-direction: row;
`;

const ItemSidebar = styled("div")`
    background-color: ${(props) => props.theme["secondary-background"]};
    height: 100%;
    width: 16rem;
    display: flex;
    margin: 0px;
    flex-shrink: 0;
    flex-direction: column;
    color: ${(props) => props.theme.foreground};
`;

const Item = styled("li")`
    background-color: ${(props) => props.theme["secondary-background"]};
    padding: 0.75rem;
    margin: 0.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    color: ${(props) => props.theme["tertiary-foreground"]};

    &[data-active="true"] {
        background-color: ${(props) => props.theme.hover};
        color: ${(props) => props.theme.foreground};
    }
`;
const Setting = styled("div")`
    background-color: ${(props) => props.theme["primary-background"]};
    color: ${(props) => props.theme.foreground};
    height: 100%;
    width: 100%;
    display: flex;
    margin: 0px;
    padding: 1.5rem;
    flex-direction: column;
`;

const [tab, setTab] = createSignal<number>(0);

const [profile, setProfile] = createStore<API.UserProfile>();

const converter = new Showdown.Converter();
converter.setFlavor("github");
converter.setOption("simplifiedAutoLink", true);
converter.setOption("tables", true);
converter.setOption("emoji", true);

client.user.fetchProfile().then((e) => {
    setProfile(e);
});

const SettingsSidebar = () => {
    const navigate = useNavigate();

    const logoutFromRevolt = async () => {
        const CURRENT_SESSION: object = await getFromStorage("session");

        if (!CURRENT_SESSION) {
            client.websocket.disconnect();
            navigate("/");
        } else {
            clearStorage("session");
            client.logout();
            navigate("/", { replace: true });
        }
    };

    console.log("Settings has been rendered");

    const ProfilePreview = styled("div")`
        background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${client.configuration.features.autumn.url}/backgrounds/${profile.background?._id}),
            ${(props) => props.theme["primary-background"]};
        display: flex;
        align-items: center;
        gap: 1rem;
        color: #fff;
        padding: 0.5rem;
        border-radius: 5px;
    `;

    return (
        <SidebarBase>
            <ItemSidebar>
                <ul class="mt-5">
                    <span class="ml-4 text-sm">User Settings</span>
                    <Item
                        class="Item"
                        data-active={tab() === 0 ? "true" : "false"}
                        onClick={() => setTab(0)}
                    >
                        <BiRegularUser />
                        My Account
                    </Item>
                    <Item
                        class="Item"
                        data-active={tab() === 1 ? "true" : "false"}
                        onClick={() => setTab(1)}
                    >
                        <BiRegularIdCard />
                        My Profile
                    </Item>
                    <span class="ml-4 text-sm">Client Settings</span>
                    <Item
                        class="Item"
                        data-active={tab() === 2 ? "true" : "false"}
                        onClick={() => setTab(2)}
                    >
                        <BiRegularNotification />
                        Notifications
                    </Item>
                    <Item
                        class="Item"
                        data-active={tab() === 3 ? "true" : "false"}
                        onClick={() => setTab(3)}
                    >
                        <BiRegularPackage />
                        Utilities
                    </Item>
                    <span class="ml-4 text-sm">Experimental</span>
                    <Item
                        class="Item"
                        data-active={tab() === 4 ? "true" : "false"}
                        onClick={() => setTab(4)}
                    >
                        <BiRegularPalette />
                        Themes
                    </Item>
                    <Item
                        class="Item"
                        data-active={tab() === 5 ? "true" : "false"}
                        onClick={() => setTab(5)}
                    >
                        <BiRegularCodeCurly />
                        Experiments
                    </Item>
                </ul>
                <button
                    class="ml-4 mt-auto mb-5 text-left flex items-center gap-[5px]"
                    onClick={() => setTab(6)}
                >
                    <BiRegularInfoCircle /> About Solenoid
                </button>
                <button
                    class="ml-4 mb-5 text-left flex items-center gap-[5px]"
                    onClick={logoutFromRevolt}
                >
                    <BiRegularExit /> Logout
                </button>
            </ItemSidebar>
            <Switch>
                <Match when={tab() === 0}>
                    <Setting>
                        <div class="mb-5">
                            <h1>My Account</h1>
                        </div>
                        <div class="flex gap-5 items-center">
                            <div>
                                <img
                                    src={client.user.generateAvatarURL()}
                                    width={64}
                                    height={64}
                                    class="rounded-full"
                                />
                            </div>
                            <div class="flex flex-col">
                                <span>@{client.user.username}</span>
                                <span>{client.user._id}</span>
                            </div>
                        </div>
                        <div>
                            <div class="mt-5">
                                <h1>Username</h1>
                                <div class="flex flex-row">
                                    <span>{client.user.username}</span>
                                    <button
                                        class="ml-auto"
                                        disabled
                                        title="TODO: Edit Username"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div class="mt-5">
                                    <h1>Status</h1>
                                    <div class="flex flex-row">
                                        <span>{client.user.status.text}</span>
                                        <button
                                            class="ml-auto"
                                            disabled
                                            title="TODO: Change Status"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-5">
                                <h1>Solenoid Badges</h1>
                                <div class="flex flex-row gap-5 mt-2">
                                    <For each={badges}>
                                        {(badge) => {
                                            if (badge.id instanceof Array<string>) {
                                                return (
                                                    <For each={badge.id}>
                                                        {(e) => {
                                                            if (e === client.user._id)
                                                                return (
                                                                    <div
                                                                        style={{
                                                                            background: badge.bkg,
                                                                            padding: "5px",
                                                                            "border-radius": "99999px",
                                                                        }}
                                                                    >
                                                                        {badge.title}
                                                                    </div>
                                                                );
                                                        }}
                                                    </For>
                                                );
                                            } else if (badge.id === client.user._id) {
                                                return <div>{badge.title}</div>;
                                            }
                                        }}
                                    </For>
                                </div>
                            </div>
                        </div>
                    </Setting>
                </Match>
                <Match when={tab() === 1}>
                    <Setting>
                        <h1 class="mb-2">My Profile</h1>
                        <div class="rounded-sm">
                            <ProfilePreview>
                                <img
                                    width={64}
                                    src={client.user.generateAvatarURL()}
                                    class="rounded-full"
                                />
                                <div>
                                    <h1>{client.user.username}</h1>
                                    <h2>{client.user.status.text}</h2>
                                </div>
                            </ProfilePreview>
                            <h1>Information</h1>
                            <div
                                // eslint-disable-next-line solid/no-innerhtml
                                innerHTML={converter.makeHtml(newProfile() || profile.content)}
                                class="p-5"
                            />
                        </div>
                        <div>
                            <textarea
                                value={newProfile() || profile.content}
                                onChange={(e) => setNewProfile(e.currentTarget.value)}
                                class="w-full h-96 bg-slate-500 text-white resize-none"
                                spellcheck
                            />
                        </div>
                        <div
                            onClick={() =>
                                client.api.patch("/users/@me", {
                                    profile: {
                                        content: newProfile() || profile.content,
                                    },
                                })
                            }
                        >
                            Update Profile
                        </div>
                        <h1>TODO: Edit Profiles</h1>
                    </Setting>
                </Match>
                <Match when={tab() === 2}>
                    <Setting>
                        <h1>Notifications</h1>
                        <p>TODO: Add Notification Settings</p>
                    </Setting>
                </Match>
                <Match when={tab() === 3}>
                    <Setting>
                        <h1>Utilities</h1>
                        <p>TODO: Add Utilities</p>
                    </Setting>
                </Match>
                <Match when={tab() === 4}>
                    <Setting>
                        <h1>Themes</h1>
                        <p>TODO: Theme Settings</p>
                    </Setting>
                </Match>
                <Match when={tab() === 5}>
                    <Setting>
                        <h1>Experiments</h1>
                        <p>TODO: Add Experiments</p>
                    </Setting>
                </Match>
                <Match when={tab() === 6}>
                    <Setting>
                        <div class="mb-5">
                            <h1>About Solenoid Client</h1>
                        </div>
                        <div class="block">
                            <p class="mb-2">
                                Solenoid is a Revolt.chat Client designed from the ground up by StationaryStation, which started from a small lightweight client and scaled to a full featured client
                                for the web.
                            </p>
                            <h2 class="text-3xl">Credits</h2>
                            <div class="mt-2">
                                <h3 class="text-xl">Main Contributors</h3>
                                <p>StationaryStation: Creator of Solenoid</p>
                                <p>Bloom: Helped with the old client interface</p>
                            </div>
                            <div class="mt-2">
                                <h3 class="text-xl">Revolt Unofficial Clients Server</h3>
                                <p>ItsMeow: Helped with testing</p>
                                <p>Lokicalmito (Lo-kiss): Helped with testing and reported a bug</p>
                                <p>Valence: Helped with testing</p>
                                <p>DoruDoLasu: Helped with testing</p>
                                <p>Error 404: Null Not Found: Helped with testing</p>
                            </div>
                            <div class="mt-2">
                                <h3 class="text-xl">Revolt Staff</h3>
                                <p>Insert: Helped with MobX and with Revolt.JS</p>
                                <p>Lea: meow</p>
                                <p>Infi: Helped with GIFBox Support for the emoji picker on the old client</p>
                                <p>Rexogamer: Helped with testing</p>
                            </div>
                            <div class="mt-2">
                                <h3 class="text-xl">Special Thanks</h3>
                                <p>
                                    RyanSolid: <a>This code snippet</a>
                                </p>
                                <p>
                                    Maclnooted: Requested <b>SEX</b>
                                </p>
                                <p>VeiledProduct80: Helped me with masquerade and with system messages</p>
                            </div>
                            <a href="https://github.com/revolt-unofficial-clients/solenoid">Github</a>
                        </div>
                    </Setting>
                </Match>
            </Switch>
            <button
                class="m-5 flex items-center justify-center relative top-0 left-0 right-0 p-5 z-10 h-5 w-5 rounded-full border-slate-800 border-4 bg-slate-900 text-white"
                onClick={() => setShowSettings(false)}
            >
                <BiRegularX />
            </button>
        </SidebarBase>
    );
};

export default SettingsSidebar;
