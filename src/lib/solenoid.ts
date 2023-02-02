import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { createLocalStore, createLocalSignal } from "../utils";

import type { user, server, reply, settings as config, status } from "../types";
import type { Message } from "revolt.js";

export const [newMessage, setNewMessage] = createSignal<string>("");
export const [loggedIn, setLoggedIn] = createSignal<boolean>(false);
export const [usr, setUser] = createLocalStore<user>("user_info", {
  user_id: undefined,
  username: undefined,
  session_type: undefined,
});

export const [servers, setServers] = createStore<server>({
  isHome: true,
});

export const [messages, setMessages] = createSignal<(Message | undefined)[]>();
export const [replies, setReplies] = createSignal<reply[]>([]);

export const [images, setImages] = createSignal<any[] | null | undefined>(undefined);
export const [imgUrls, setImgUrls] = createSignal<any[] | null | undefined>([]);
export const [pickerType, setPickerType] = createSignal<"react" | "emoji">("emoji");

// Experimental Server side Nickname Switcher
export const [avatarImage, setAvatarImage] = createSignal<any>();
export const [nickname, setNickname] = createSignal<string>();

// Status Prefabs
export const [newMode, setNewMode] = createSignal<
  "Online" | "Idle" | "Focus" | "Busy" | "Invisible"
>();
export const [newStatus, setNewStatus] = createSignal<string | null>();

// Solenoid Default Settings
export const [settings, setSettings] = createLocalStore<config>("settings", {
  show: false,
  showSuffix: false,
  suffix: false,
  newShowSuffix: undefined,
  zoomLevel: 5,
  session: undefined,
  session_type: undefined,
  showImages: true,
  debug: false,
  emoji: "mutant",
  experiments: {
    picker: false,
    compact: false,
    newhome: false,
    nick: false,
    edited_format: "default",
    disappear: false,
  },
});

export const [statuslist, setStatusList] = createLocalSignal<status[]>(
  "statusList",
  []
);
// Experimental Emoji Picker
export const [showPicker, setShowPicker] = createSignal<boolean>(false);
