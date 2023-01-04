import type { Server, Message, Channel } from "revolt.js";

declare interface user {
    user_id: string | undefined;
    username: string | undefined;
    session_type: "email" | "token" | undefined;
}

declare interface loginValues {
    email?: string;
    password?: string;
    token?: string;
    mfa_token?: string;
}

declare interface server {
    server_list?: Server[] | undefined;
    current_server?: Server | undefined;
    current_server_channels?: (Channel | undefined)[];
    current_channel?: Channel | undefined;
    messages?: Message[] | undefined;
    isHome: boolean | undefined;
}

declare interface status {
    id: number,
    mode:
    | "Online"
    | "Focus"
    | "Idle"
    | "Busy"
    | "Invisible"
    | null
    | undefined,
    text: string,
}

declare interface reply {
    id: string,
    mention: boolean
}

declare interface settings {
    show: boolean;
    status?:
    | "Online"
    | "Focus"
    | "Idle"
    | "Busy"
    | "Invisible"
    | null
    | undefined;
    statusText?: any;
    showSuffix: boolean;
    newShowSuffix: undefined | boolean;
    suffix: boolean;
    session?: any | undefined;
    session_type?: string | undefined;
    zoomLevel: number;
    showImages: boolean;
    debug: boolean;
    emoji: "mutant" | "twemoji" | "fluent-3d" | string;
    experiments: {
        picker: boolean,
        compact: boolean,
        nick: boolean,
        edited_format: "ISO" | "UTC" | "default" | string,
        disappear: boolean
    }
}
