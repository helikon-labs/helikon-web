import { createSignal } from 'solid-js';

export type ThemePreference = 'system' | 'light' | 'dark';

function getSaved(): ThemePreference {
    try {
        return (localStorage.getItem('theme-preference') as ThemePreference | null) ?? 'system';
    } catch {
        return 'system';
    }
}

export const [themePreference, setThemePreference] = createSignal<ThemePreference>(getSaved());
