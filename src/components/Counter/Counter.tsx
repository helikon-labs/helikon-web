import { counter, setCounter } from '@/store/data-store';
import styles from './Counter.module.css';

export function Counter() {
    return (
        <button type="button" class={styles['counter']} onClick={() => setCounter((c) => c + 1)}>
            count is {counter()}
        </button>
    );
}
