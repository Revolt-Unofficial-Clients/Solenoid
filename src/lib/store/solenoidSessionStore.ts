import { createStore } from "solid-js/store"

interface RevoltSession {
    token: string;
    type: "user" | "bot";
}

const [revoltUserSession, setRevoltUserSession] = createStore<RevoltSession>({
    token: "",
    type: "bot"
});

export type { RevoltSession }
export { revoltUserSession, setRevoltUserSession }