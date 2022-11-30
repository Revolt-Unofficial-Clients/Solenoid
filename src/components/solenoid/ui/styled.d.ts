import "solid-styled-components"

declare module "solid-styled-components" {
    export interface DefaultTheme {
        accent?: string;
        background?: string;
        block?: string;
        error?: string;
        foreground?: string;
        hover?: string;
        mention?: string;
        "message-box"?: string;
        "primary-background"?: string;
        "primary-header"?: string;
        "scrollbar-thumb"?: string;
        "secondary-background"?: string;
        "secondary-foreground"?: string;
        "secondary-header"?: string;
        "status-away"?: string;
        "status-busy"?: string;
        "status-invisible"?: string;
        "status-online"?: string;
        success?: string;
        "tertiary-background"?: string;
        "tertiary-foreground"?: string;
        warning?: string;
        tooltip?: string;
        "scrollbar-track"?: string;
        "status-focus"?: string;
        "status-streaming"?: string;
        light?: boolean;
    }
}