import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '@/utils/logger';

describe('logger', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('info', () => {
        it('calls console.log with message', () => {
            logger.info('hello');
            expect(console.log).toHaveBeenCalledWith('hello');
        });

        it('forwards additional arguments', () => {
            logger.info('hello', 'world', 42);
            expect(console.log).toHaveBeenCalledWith('hello', 'world', 42);
        });
    });

    describe('warn', () => {
        it('calls console.warn with message', () => {
            logger.warn('warning');
            expect(console.warn).toHaveBeenCalledWith('warning');
        });

        it('forwards additional arguments', () => {
            logger.warn('warning', { code: 404 });
            expect(console.warn).toHaveBeenCalledWith('warning', { code: 404 });
        });
    });

    describe('error', () => {
        it('calls console.error with message', () => {
            logger.error('oops');
            expect(console.error).toHaveBeenCalledWith('oops');
        });

        it('forwards additional arguments', () => {
            const err = new Error('fail');
            logger.error('oops', err);
            expect(console.error).toHaveBeenCalledWith('oops', err);
        });
    });

    describe('debug', () => {
        it('calls console.log with [DEBUG] prefix in DEV mode', () => {
            logger.debug('test message');
            expect(console.log).toHaveBeenCalledWith('[DEBUG] test message');
        });

        it('forwards additional arguments with [DEBUG] prefix', () => {
            logger.debug('test', 1, 2);
            expect(console.log).toHaveBeenCalledWith('[DEBUG] test', 1, 2);
        });

        it('does not call console.log outside DEV mode', () => {
            const original = import.meta.env.DEV;
            (import.meta.env as Record<string, unknown>).DEV = false;
            logger.debug('silent');
            expect(console.log).not.toHaveBeenCalled();
            (import.meta.env as Record<string, unknown>).DEV = original;
        });
    });
});
