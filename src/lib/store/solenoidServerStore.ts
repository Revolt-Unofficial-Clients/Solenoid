import { createStore } from "solid-js/store"
import type {
    BaseMessage,
    Category,
    Server,
    ServerChannel
} from "revolt-toolset"

interface SolenoidServerStore {
    list?: Server[]
    current?: Server | null
    channel?: {
        list: Category[] | null,
        current: ServerChannel | null
        messages: BaseMessage[] | null
    }
    displayHomescreen: boolean
}

const [solenoidServer, setSolenoidServer] = createStore<SolenoidServerStore>({
    displayHomescreen: false
})

export type { SolenoidServerStore }
export { solenoidServer, setSolenoidServer }