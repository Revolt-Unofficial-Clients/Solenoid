import { Component, createSignal } from "solid-js";
import { SetStoreFunction, Store } from "solid-js/store/types";
import { settings } from "../../types";

import { FiXCircle } from "solid-icons/fi";

interface componentProps {
    setSettings: SetStoreFunction<settings>
    settings: Store<settings>
    logout: () => void;
}

// Current Tab:
// 0: User Settings
// 1: Server Settings
// 2: Client Settings
// 3: Experiments
// 4: About
const [currentTab, setCurrentTab] = createSignal<number>(0);

const Settings: Component<componentProps> = (props) => {
    return (
        <div class="settings">
            <div class="titlebar">
                <h3 class="title" onClick={() => setCurrentTab(69420)}>Settings</h3>
                <div class="close" role="button" onClick={() => {
                props.setSettings("show", false);
                console.log("you should hide settings... NOW")
                }}>
                <FiXCircle />
                </div>
            </div> 
            <div class="content">
                <div class="sidebar">
                <div class="item" id="si1" onClick={() => setCurrentTab(0)}>User</div>
                <div class="item" id="si2" onClick={() => setCurrentTab(1)}>Server</div>
                <div class="item" id="si3" onClick={() => setCurrentTab(2)}>Client</div>
                <div class="item" id="si4" onClick={() => setCurrentTab(3)}>Experiments</div>
                <div class="item" id="si5" onClick={() => setCurrentTab(4)}>About</div>
                <div class="item" id="silogout" onClick={props.logout}>Logout</div>
                </div>
                <div class="setting">
                    {currentTab() === 0 ? (
                        <div>
                            <h3>User Settings</h3>
                        </div>
                    ) : currentTab() === 1 ? (
                        <div>
                            <h3>Server Settings</h3>
                        </div>
                    ) : currentTab() === 2 ? (
                        <div>
                            <h3>Client Settings</h3>
                        </div>
                    ) : currentTab() === 3 ?(
                        <div>
                            <h3>Experiments</h3>
                        </div>
                    ): currentTab() === 4 ? (
                        <div>
                            <h3>About Solenoid</h3>
                        </div>
                    ) : (
                        <div>
                            <h3>GET THE FUCK OUT OF MY PALACE</h3>
                            <p>- Gabriel Ultrakill, 2022</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export {Settings};