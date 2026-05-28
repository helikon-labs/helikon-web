import { onMount, onCleanup } from 'solid-js';
import typescriptLogo from '@/typescript.svg';
import { Counter } from '@/components/Counter';
import { AppEvent, eventBus, type EventMap } from '@/event/event';
import { logger } from '@/logger';

export default function App() {
    const onHidden = (): void => {
        logger.info('Hidden.');
    };
    const onVisible = (): void => {
        logger.info('Visible.');
    };
    const onPing = (event: EventMap[typeof AppEvent.Ping]): void => {
        logger.info('Ping message: ', event.message);
    };
    const onThemeChange = (newTheme: EventMap[typeof AppEvent.UI.Theme.Change]): void => {
        logger.info('Theme:', newTheme);
    };
    const onLayoutChange = (event: EventMap[typeof AppEvent.UI.Layout.Resize]): void => {
        logger.info('New w/h:', event.width, event.height);
    };

    onMount(() => {
        const onResize = () => {
            eventBus.emit(AppEvent.UI.Layout.Resize, {
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                eventBus.emit(AppEvent.Hidden);
            } else if (document.visibilityState === 'visible') {
                eventBus.emit(AppEvent.Visible);
            }
        };
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const onSystemThemeChange = (e: MediaQueryListEvent) => {
            eventBus.emit(AppEvent.UI.Theme.Change, e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', onSystemThemeChange);
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVisibilityChange);

        eventBus.on(AppEvent.Hidden, onHidden);
        eventBus.on(AppEvent.Visible, onVisible);
        eventBus.on(AppEvent.UI.Layout.Resize, onLayoutChange);
        eventBus.on(AppEvent.UI.Theme.Change, onThemeChange);
        eventBus.on(AppEvent.Ping, onPing);

        eventBus.emit(AppEvent.UI.Theme.Change, mediaQuery.matches ? 'dark' : 'light');

        const t1 = setTimeout(() => {
            eventBus.emit(AppEvent.Ping, { message: 'Check 1-2-3!' });
        }, 2500);

        onCleanup(() => {
            mediaQuery.removeEventListener('change', onSystemThemeChange);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            eventBus.off(AppEvent.Hidden, onHidden);
            eventBus.off(AppEvent.Visible, onVisible);
            eventBus.off(AppEvent.UI.Layout.Resize, onLayoutChange);
            eventBus.off(AppEvent.UI.Theme.Change, onThemeChange);
            eventBus.off(AppEvent.Ping, onPing);
            clearTimeout(t1);
        });
    });

    return (
        <div>
            <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                <img src="/img/favicon.svg" class="logo" alt="Vite logo" />
            </a>
            <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
                <img src={typescriptLogo} class="logo vanilla" alt="TypeScript logo" />
            </a>
            <h1>Vite + Solid + TypeScript</h1>
            <div class="card">
                <Counter />
            </div>
            <p class="read-the-docs">Click on the Vite and TypeScript logos to learn more</p>
        </div>
    );
}
