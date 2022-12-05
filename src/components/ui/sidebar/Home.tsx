import { Match, Switch } from "solid-js";
import HomeScreen from "../home/HomeScreen";
import DirectMessages from "./DirectMessages";
import { DMtab } from "./DirectMessages";

const Home = () => {
    return (
        <div class="w-full h-screen flex flex-row bg-slate-500">
            <DirectMessages />
            <Switch>
                <Match when={DMtab() === 0}>
                    <HomeScreen />
                </Match>
                <Match when={DMtab() === 1}>
                    <p>TODO: Friends Tab</p>
                </Match>
                <Match when={DMtab() === 2}>
                    <p>TODO: Saved Notes Tab</p>
                </Match>
            </Switch>
        </div>
    )
}

export default Home;