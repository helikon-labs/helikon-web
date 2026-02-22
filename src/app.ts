import typescriptLogo from './typescript.svg';
import viteLogo from '/favicon.svg';
import { setupCounter } from './counter';

import { AppEvent, eventBus, type EventMap } from './event/event';
import { logger } from './logger';
import { $counter } from './data/data-store';

class App {
    private unsubs: Array<() => void> = [];
    private timers: Array<number> = [];

    constructor() {}

    private onPing = async (): Promise<void> => {
        logger.info('Pong.');
    };

    private onClose = async (event: EventMap[typeof AppEvent.Close]): Promise<void> => {
        logger.info('Close', event.id);
    };

    private onLayoutChange = async (
        event: EventMap[typeof AppEvent.UI.Layout.Resize],
    ): Promise<void> => {
        logger.info('New height:', event.height);
    };

    async start() {
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
            <div>
                <a href="https://vite.dev" target="_blank">
                <img src="${viteLogo}" class="logo" alt="Vite logo" />
                </a>
                <a href="https://www.typescriptlang.org/" target="_blank">
                <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
                </a>
                <h1>Vite + TypeScript</h1>
                <div class="card">
                <button id="counter" type="button"></button>
                </div>
                <p class="read-the-docs">
                Click on the Vite and TypeScript logos to learn more
                </p>
            </div>
        `;
        setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);

        try {
            eventBus.on(AppEvent.Ping, this.onPing);
            eventBus.on(AppEvent.Close, this.onClose);
            eventBus.on(AppEvent.UI.Layout.Resize, this.onLayoutChange);

            const unsub = $counter.subscribe((value, oldValue) => {
                logger.info(`counter value changed from ${oldValue} to ${value}`);
            });
            this.unsubs.push(unsub);

            this.timers.push(
                setTimeout(() => {
                    eventBus.emit(AppEvent.Ping);
                    eventBus.emit(AppEvent.Close, { id: 'close-id-200' });
                }, 2500),
            );
            this.timers.push(
                setTimeout(() => {
                    eventBus.emit(AppEvent.UI.Layout.Resize, { width: 1920, height: 1080 });
                }, 5000),
            );
        } catch (error) {
            logger.error('Failed to start app:', error);
        }
    }

    async stop() {
        logger.info('Stop app.');
        eventBus.off(AppEvent.Ping, this.onPing);
        eventBus.off(AppEvent.Close, this.onClose);
        eventBus.off(AppEvent.UI.Layout.Resize, this.onLayoutChange);
        for (const unsub of this.unsubs) {
            unsub();
        }
        this.unsubs = [];
        for (const timer of this.timers) {
            clearTimeout(timer);
        }
        this.timers = [];
        $counter.set(0);
    }
}

export { App };
