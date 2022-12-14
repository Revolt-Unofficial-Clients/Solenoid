import { Channel, Server } from "revolt.js";
import { createSignal } from "solid-js";

export const [selectedServer, setSelectedServer] = createSignal<Server | null>();
export const [selectedChannel, setSelectedChannel] = createSignal<Channel | null>();