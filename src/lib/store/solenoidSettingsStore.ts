import { createStore } from "solid-js/store";
import { ThemeSettings, DEFAULT_THEME } from "revolt-toolset"
import { UserPresence } from "./solenoidUserStore";
import { createSignal } from "solid-js";

enum EMOJI_PACKS {
    DEFAULT = "mutant",
    TWEMOJI = "twemoji",
    FLUENT = "fluent-3d",
    NOTOSANS = "noto-sans"
}

interface SolenoidStatusPrefab {
    id: number,
    name?: string,
    status?: string,
    presence: UserPresence
}

interface SolenoidSettingsStore {
    client: {
        showProfilePictures: boolean
        showAttachments: boolean
        shouldUseCompactMode: boolean
        showBadges: boolean
        disableMarkdown: boolean
        emoji: EMOJI_PACKS
        developer: {
            debug: boolean
        }
    }

    user: {
        status: {
            prefabList: (SolenoidStatusPrefab | undefined)[]
        }
    }

    appearance: {
        theme: ThemeSettings
    }

    experiments: {
        enableEmojiPicker: boolean
        enableNewHomescreen: boolean
        enableServerSettings: boolean
        disableTypingEvent: boolean
        enableChangeIdentity: boolean
    }
}

const [userSettings, setUserSettings] = createStore<SolenoidSettingsStore>({
    client: {
        disableMarkdown: false,
        emoji: EMOJI_PACKS.DEFAULT,
        shouldUseCompactMode: false,
        showAttachments: true,
        showBadges: true,
        showProfilePictures: true,
        developer: {
            debug: false
        }
    },

    user: {
        status: {
            prefabList: []
        }
    },

    appearance: {
        theme: DEFAULT_THEME
    },

    experiments: {
        disableTypingEvent: false,
        enableEmojiPicker: false,
        enableNewHomescreen: false,
        enableServerSettings: false,
        enableChangeIdentity: false
    }
})

const [showSettingsPanel, setShowSettingsPanel] = createSignal<boolean>(false);

export type { SolenoidSettingsStore }
export { EMOJI_PACKS, userSettings, setUserSettings, showSettingsPanel, setShowSettingsPanel }