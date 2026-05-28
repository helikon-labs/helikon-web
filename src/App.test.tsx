import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { AppEvent, eventBus } from '@/event/event';
import { logger } from '@/utils/logger';

describe('App', () => {
    let triggerSystemThemeChange: (isDark: boolean) => void;

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn().mockReturnValue(null),
            setItem: vi.fn(),
        });
        vi.spyOn(logger, 'info').mockImplementation(() => {});

        const mqlListeners: ((e: Partial<MediaQueryListEvent>) => void)[] = [];
        triggerSystemThemeChange = (isDark) => {
            mqlListeners.forEach((l) => l({ matches: isDark }));
        };

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockReturnValue({
                matches: false,
                addEventListener: vi.fn(
                    (_type: string, handler: (e: Partial<MediaQueryListEvent>) => void) => {
                        mqlListeners.push(handler);
                    },
                ),
                removeEventListener: vi.fn(),
            }),
        });
    });

    afterEach(() => {
        document.documentElement.removeAttribute('data-theme');
        vi.unstubAllGlobals();
        cleanup();
        vi.restoreAllMocks();
        eventBus.all.clear();
        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
            configurable: true,
        });
    });

    describe('rendering', () => {
        it('renders the heading', () => {
            render(() => <App />);
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
                'Vite + Solid + TypeScript',
            );
        });

        it('renders the counter', () => {
            render(() => <App />);
            expect(screen.getByRole('button', { name: /count is/i })).toBeInTheDocument();
        });

        it('renders logo images', () => {
            render(() => <App />);
            expect(screen.getByAltText('Vite logo')).toBeInTheDocument();
            expect(screen.getByAltText('TypeScript logo')).toBeInTheDocument();
        });

        it('renders the docs link text', () => {
            render(() => <App />);
            expect(screen.getByText(/Click on the Vite/)).toBeInTheDocument();
        });

        it('renders the theme switcher', () => {
            render(() => <App />);
            expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
        });
    });

    describe('theme', () => {
        it('sets data-theme to light on mount when system is light', () => {
            render(() => <App />);
            expect(document.documentElement).toHaveAttribute('data-theme', 'light');
        });

        it('sets data-theme to dark on mount when system is dark', () => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockReturnValue({
                    matches: true,
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                }),
            });
            render(() => <App />);
            expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
        });

        it('updates data-theme when system theme changes to dark', () => {
            render(() => <App />);
            triggerSystemThemeChange(true);
            expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
        });

        it('updates data-theme when system theme changes to light', () => {
            render(() => <App />);
            triggerSystemThemeChange(false);
            expect(document.documentElement).toHaveAttribute('data-theme', 'light');
        });

        it('emits theme change event and logs it when theme switcher is clicked', () => {
            render(() => <App />);
            const switcher = screen.getByRole('button', { name: /theme/i });
            fireEvent.click(switcher);
            expect(logger.info).toHaveBeenCalledWith('Theme:', expect.stringMatching(/dark|light/));
        });
    });

    describe('visibility', () => {
        it('logs hidden when page becomes hidden', () => {
            render(() => <App />);
            Object.defineProperty(document, 'visibilityState', {
                value: 'hidden',
                configurable: true,
            });
            document.dispatchEvent(new Event('visibilitychange'));
            expect(logger.info).toHaveBeenCalledWith('Hidden.');
        });

        it('logs visible when page becomes visible', () => {
            render(() => <App />);
            Object.defineProperty(document, 'visibilityState', {
                value: 'visible',
                configurable: true,
            });
            document.dispatchEvent(new Event('visibilitychange'));
            expect(logger.info).toHaveBeenCalledWith('Visible.');
        });
    });

    describe('layout', () => {
        it('emits layout resize event on window resize', () => {
            render(() => <App />);
            const handler = vi.fn();
            eventBus.on(AppEvent.UI.Layout.Resize, handler);
            window.dispatchEvent(new Event('resize'));
            expect(handler).toHaveBeenCalledWith({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            eventBus.off(AppEvent.UI.Layout.Resize, handler);
        });

        it('logs layout change when resize event is received', () => {
            render(() => <App />);
            eventBus.emit(AppEvent.UI.Layout.Resize, { width: 1920, height: 1080 });
            expect(logger.info).toHaveBeenCalledWith('New w/h:', 1920, 1080);
        });
    });

    describe('ping', () => {
        it('logs ping message when ping event fires', () => {
            render(() => <App />);
            eventBus.emit(AppEvent.Ping, { message: 'Hello' });
            expect(logger.info).toHaveBeenCalledWith('Ping message: ', 'Hello');
        });

        it('emits ping event after 2500ms', () => {
            vi.useFakeTimers();
            render(() => <App />);
            vi.advanceTimersByTime(2500);
            expect(logger.info).toHaveBeenCalledWith('Ping message: ', 'Check 1-2-3!');
            vi.useRealTimers();
        });
    });

    describe('cleanup', () => {
        it('removes event bus listeners on unmount', () => {
            const { unmount } = render(() => <App />);
            unmount();
            vi.clearAllMocks();
            eventBus.emit(AppEvent.Ping, { message: 'after unmount' });
            eventBus.emit(AppEvent.UI.Theme.Change, 'dark');
            expect(logger.info).not.toHaveBeenCalled();
        });
    });
});
