import { createStore } from "solid-js/store"
import type {
    BaseMessage,
    Category,
    Server,
    ServerChannel
} from "revolt-toolset"

interface SolenoidServerStore {
    list?: Server[]
    current?: Server
    channel?: {
        list: Category[],
        current: ServerChannel
        messages: BaseMessage[]
    }
    displayHomescreen: boolean
}

const [solenoidServer, setSolenoidServer] = createStore<SolenoidServerStore>({
    displayHomescreen: false
})

export type { SolenoidServerStore }
export { solenoidServer, setSolenoidServer }