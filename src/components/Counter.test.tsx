import { fireEvent, render, screen } from '@solidjs/testing-library';
import { beforeEach, describe, expect, it } from 'vitest';
import { Counter } from '@/components/Counter';
import { setCounter } from '@/store/data-store';

describe('Counter', () => {
    beforeEach(() => {
        // reset shared module state before each test
        setCounter(0);
    });
    it('renders initial count', () => {
        render(() => <Counter />);
        expect(screen.getByRole('button')).toHaveTextContent('count is 0');
    });
    it('increments count on click', async () => {
        render(() => <Counter />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(button).toHaveTextContent('count is 1');
        fireEvent.click(button);
        expect(button).toHaveTextContent('count is 2');
    });
});
