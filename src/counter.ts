import { $counter } from './data/data-store';

export function setupCounter(element: HTMLButtonElement) {
    $counter.subscribe((value, _oldValue) => {
        element.innerHTML = `count is ${value}`;
    });
    element.addEventListener('click', () => $counter.set($counter.get() + 1));
}
