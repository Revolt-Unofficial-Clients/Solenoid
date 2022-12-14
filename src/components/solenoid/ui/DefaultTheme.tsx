import { DEFAULT_THEME, ThemeSettings } from "revolt-toolset";
import { DefaultTheme } from "solid-styled-components";
import { createStore } from "solid-js/store";

export const [currentTheme, setCurrentTheme] = createStore<ThemeSettings>(DEFAULT_THEME);

export const theme: DefaultTheme = currentTheme;