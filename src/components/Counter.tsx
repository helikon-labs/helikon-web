import { counter, setCounter } from '@/store/data-store';

export function Counter() {
    return (
        <button type="button" onClick={() => setCounter((c) => c + 1)}>
            count is {counter()}
        </button>
    );
}
