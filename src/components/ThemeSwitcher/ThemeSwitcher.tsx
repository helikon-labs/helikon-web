import { Match, Switch } from 'solid-js';
import Monitor from 'lucide-solid/icons/monitor';
import Moon from 'lucide-solid/icons/moon';
import Sun from 'lucide-solid/icons/sun';
import { themePreference, setThemePreference, type ThemePreference } from '@/store/theme-store';
import styles from './ThemeSwitcher.module.css';
import { AppEvent, eventBus } from '@/event/event';

const CYCLE: ThemePreference[] = ['system', 'light', 'dark'];
const LABELS: Record<ThemePreference, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
};

export function ThemeSwitcher() {
    const cycle = () => {
        const idx = CYCLE.indexOf(themePreference());
        const next = CYCLE[(idx + 1) % CYCLE.length] ?? 'system';
        localStorage.setItem('theme-preference', next);
        setThemePreference(next);
        const isDark =
            next === 'dark' ||
            (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        eventBus.emit(AppEvent.UI.Theme.Change, isDark ? 'dark' : 'light');
    };

    return (
        <button
            type="button"
            class={styles['theme-switcher']}
            onClick={cycle}
            aria-label={`Theme: ${LABELS[themePreference()]}`}
        >
            <Switch>
                <Match when={themePreference() === 'system'}>
                    <Monitor size={16} />
                </Match>
                <Match when={themePreference() === 'light'}>
                    <Sun size={16} />
                </Match>
                <Match when={themePreference() === 'dark'}>
                    <Moon size={16} />
                </Match>
            </Switch>
        </button>
    );
}
