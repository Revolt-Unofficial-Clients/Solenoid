import { RevoltBadges, UserBadge } from "revolt-toolset";
import { createStore } from "solid-js/store";

type UserPresence = "Online" | "Busy" | "Focus" | "Idle" | "Invisible" | null | undefined

interface RevoltUserInfoStore {
    isLoggedIn: boolean
    username: string
    avatar?: string
    status?: string
    presence: UserPresence
    server?: {
        nickname?: string
        avatar?: string 
    }

    badges: (UserBadge | undefined )[] 
}



const [revoltUserInfo, setRevoltUserInfo] = createStore<RevoltUserInfoStore>({
    isLoggedIn: false,
    username: "",
    badges: [],
    presence: "Online"
})

export type { RevoltUserInfoStore, UserPresence }
export { revoltUserInfo, setRevoltUserInfo}