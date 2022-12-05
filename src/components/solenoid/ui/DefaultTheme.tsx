import { DEFAULT_THEME } from "revolt-toolset";
import { DefaultTheme } from "solid-styled-components";
import { createSignal } from "solid-js";
export const [currentTheme, setCurrentTheme] = createSignal<DefaultTheme>();

export const theme: DefaultTheme = currentTheme() || DEFAULT_THEME;