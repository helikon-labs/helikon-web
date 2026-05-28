# Stack

A high-performance, modular, reactive web application stack built around SolidJS. Targets desktop-quality UX in the browser — fine-grained reactivity, minimal runtime overhead, and direct DOM control throughout.

---

## Philosophy

- **No magic.** Every dependency is explicit and composable. No framework owns the app lifecycle.
- **Minimal footprint.** Every package is tree-shakeable. Only what is imported is bundled.
- **TypeScript-first.** Every dependency ships its own types or has first-class TS support.
- **Platform proximity.** Prefer native browser APIs. Reach for a library only when the platform falls short.
- **State lives where it makes sense.** Module-level signals and stores are the primary state primitive — no providers, no context, no wiring.

---

## Project Structure

```
src/
  index.tsx         # Entry point — mounts the Solid app
  App.tsx           # Root component — global listeners, app lifecycle
  assets/           # Images, SVGs, fonts
  components/       # Reusable UI components (.tsx)
  event/            # Typed event bus definitions
    base.ts         # App-level events (visibility, ping, etc.)
    ui.ts           # UI-level events (layout, theme, etc.)
    event.ts        # Assembles AppEvent and EventMap, exports eventBus
  examples/         # Reference examples (kept for documentation, not production use)
  pages/            # Route-level page components
  store/            # Shared application state (Solid signals and stores)
  styles/           # Global CSS, design tokens, resets
  utils/            # Pure utility functions (logger, formatters, etc.)
```

Path alias: `@/` maps to `src/`. Use `@/components/Button` instead of relative paths.

---

## Build & Tooling

| Package                                                | Role                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `vite` + `vite-plugin-solid`                           | Dev server, bundler, and Solid JSX compiler                                    |
| `typescript`                                           | Type safety — strict mode, no emit (Vite owns transpilation)                   |
| `lightningcss` + `browserslist`                        | CSS transforms, nesting, vendor prefixes, minification                         |
| `browserslist-to-esbuild`                              | Converts browserslist query to esbuild targets for consistent JS/CSS targeting |
| `vitest` + `@solidjs/testing-library`                  | Unit and component testing                                                     |
| `eslint` + `typescript-eslint` + `eslint-plugin-solid` | Linting — TS-aware rules + Solid-specific reactivity rules                     |
| `eslint-plugin-jsx-a11y`                               | Accessibility enforcement on JSX elements                                      |
| `prettier` + `eslint-config-prettier`                  | Formatting — prettier wins on style, eslint wins on correctness                |

Browser targets are defined once in `package.json` (`browserslist` field) and consumed by both `lightningcss` (CSS) and `browserslist-to-esbuild` (JS). The build target and CSS target always stay in sync.

---

## Runtime Libraries

### `solid-js` (~7kb)

The rendering and reactivity layer. JSX compiles to targeted DOM operations — no virtual DOM, no diffing. Only the exact DOM nodes that depend on a changed signal update.

**Reactivity primitives:**

```ts
const [count, setCount] = createSignal(0); // atomic value
const [user, setUser] = createStore({ name: '' }); // object / array
const double = createMemo(() => count() * 2); // derived value
createEffect(() => console.log(count())); // reactive side effect
```

**Async data:**

```ts
const [data] = createResource(() => ky.get('/api/items').json());
// data.loading, data.error, data() — integrates with <Suspense>
```

**Control flow** (do not use JS array methods for reactive lists — use these):

```tsx
<Show when={isLoggedIn()} fallback={<Login />}>
    <Dashboard />
</Show>

<For each={items()}>
    {(item) => <Card item={item} />}
</For>

<Switch>
    <Match when={status() === 'loading'}><Spinner /></Match>
    <Match when={status() === 'error'}><Error /></Match>
    <Match when={status() === 'ok'}><Content /></Match>
</Switch>
```

**Async UI:**

```tsx
<Suspense fallback={<Spinner />}>
    <DataDependentComponent />
</Suspense>

<ErrorBoundary fallback={(err) => <p>{err.message}</p>}>
    <RiskyComponent />
</ErrorBoundary>
```

**Enter/exit animations:**

```tsx
<Transition name="fade">
    <Show when={visible()}>
        <Panel />
    </Show>
</Transition>
```

**Lifecycle:**

```ts
onMount(() => {
    // runs after the component mounts
    onCleanup(() => {
        // runs when the component is destroyed — co-locate setup and teardown
    });
});
```

---

### `@solidjs/router`

Official first-party router. Nested routes, lazy loading, typed params.

```tsx
// main.tsx
import { Router, Route } from '@solidjs/router';

render(
    () => (
        <Router>
            <Route path="/" component={Home} />
            <Route path="/settings" component={lazy(() => import('./pages/Settings'))} />
            <Route path="/user/:id" component={UserDetail} />
        </Router>
    ),
    root,
);
```

```tsx
// Inside a component
import { useNavigate, useParams, useSearchParams, useLocation } from '@solidjs/router';

const params = useParams<{ id: string }>();
const [search] = useSearchParams();
const navigate = useNavigate();

navigate('/settings', { replace: true });
```

Use `<A href="/path">` instead of `<a>` for client-side navigation (handles active class automatically).

---

### `mitt` (~0.2kb)

Typed pub/sub event bus. Used for app-level and UI-level events that cross component boundaries without coupling components directly.

Events are defined as namespaced constant objects and typed via `EventMap`. The bus is a single shared module-level instance.

```ts
// event/event.ts
export const eventBus = mitt<EventMap>();

// emit
eventBus.emit(AppEvent.UI.Theme.Change, 'dark');

// subscribe
eventBus.on(AppEvent.UI.Theme.Change, (theme) => { ... });
eventBus.off(AppEvent.UI.Theme.Change, handler);

// clear all listeners (e.g. in tests)
eventBus.all.clear();
```

Always unsubscribe in `onCleanup`. See `App.tsx` for the canonical pattern.

---

### `ky` (~3kb)

Lightweight `fetch` wrapper with a clean API.

```ts
import ky from 'ky';

const client = ky.create({ prefixUrl: 'https://api.example.com' });

const data = await client.get('users/42').json<User>();
const result = await client.post('users', { json: { name: 'Kutsal' } }).json<User>();
```

**Hooks** for cross-cutting concerns (auth headers, error logging):

```ts
const client = ky.create({
    hooks: {
        beforeRequest: [(req) => req.headers.set('Authorization', `Bearer ${token()}`)],
        afterResponse: [
            (_req, _opts, res) => {
                if (!res.ok) logger.warn(res.statusText);
            },
        ],
    },
    retry: { limit: 2 },
    timeout: 10_000,
});
```

---

### `date-fns`

Tree-shakeable date utility library. Import only the functions you use.

```ts
import { format, formatDistanceToNow, add, differenceInDays, parseISO } from 'date-fns';

format(new Date(), 'yyyy-MM-dd'); // "2026-05-28"
formatDistanceToNow(parseISO('2026-01-01')); // "5 months ago"
add(new Date(), { days: 7, hours: 3 });
differenceInDays(endDate, startDate);
```

For currency, numbers, and relative time not involving date objects, use the native `Intl` API — no dependency needed.

---

### `lucide-solid`

1500+ icons as Solid components. Tree-shakeable — only imported icons are bundled.

```tsx
import { Settings, Bell, ChevronDown } from 'lucide-solid';

<Settings size={20} strokeWidth={1.5} class="icon" />
<Bell size={16} color="var(--color-accent)" />
```

Props: `size` (number), `color` (string), `strokeWidth` (number), `class` (string), `absoluteStrokeWidth` (boolean).

---

### `animejs` (~6kb)

Animation library for complex, sequenced, and physics-based animations directly on DOM elements. Works naturally with Solid's direct-DOM rendering model.

For micro-animations (hover, enter/exit transitions), use Solid's `<Transition>` + CSS — zero cost. Reach for animejs when you need sequencing, timelines, spring physics, or stagger.

```ts
import { animate, timeline, stagger, spring } from 'animejs';

// Keyframe animation
animate('.card', {
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutCubic',
});

// Timeline — sequenced animations
timeline()
    .add('.header', { opacity: [0, 1], duration: 300 })
    .add('.content', { translateY: [10, 0], opacity: [0, 1] }, '-=100');

// Spring physics
animate('.panel', {
    translateX: 200,
    ease: spring({ stiffness: 200, damping: 20 }),
});

// Stagger — animate a list with offset delays
animate('.list-item', {
    opacity: [0, 1],
    delay: stagger(50),
});
```

Use a Solid `ref` to target a specific component's DOM node:

```tsx
let el!: HTMLDivElement;
onMount(() => animate(el, { opacity: [0, 1] }));
<div ref={el}>...</div>;
```

---

### `@floating-ui/dom` (~10kb)

Positioning engine for tooltips, dropdowns, context menus, popovers, and any element that must float relative to another. Handles viewport overflow, flipping, and shifting automatically.

```ts
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';

const { x, y } = await computePosition(referenceEl, floatingEl, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
});

Object.assign(floatingEl.style, { left: `${x}px`, top: `${y}px` });
```

Use `autoUpdate` to keep position live while the reference element moves (scroll, resize):

```ts
onMount(() => {
    const cleanup = autoUpdate(referenceEl, floatingEl, () => {
        computePosition(referenceEl, floatingEl, { ... }).then(({ x, y }) => {
            Object.assign(floatingEl.style, { left: `${x}px`, top: `${y}px` });
        });
    });
    onCleanup(cleanup);
});
```

---

### `valibot` (~1kb core)

TypeScript-first schema validation. Tree-shakeable — only the validators you import are bundled. Use at system boundaries: form input, API responses, URL params.

```ts
import * as v from 'valibot';

const UserSchema = v.object({
    id: v.number(),
    name: v.pipe(v.string(), v.minLength(1)),
    email: v.pipe(v.string(), v.email()),
    role: v.picklist(['admin', 'user']),
    bio: v.optional(v.string()),
});

type User = v.InferOutput<typeof UserSchema>;

// Throws on invalid input
const user = v.parse(UserSchema, rawData);

// Returns { success, output, issues } — use for user-facing validation
const result = v.safeParse(UserSchema, formData);
if (!result.success) {
    const errors = result.issues.map((i) => i.message);
}
```

---

### `reconnecting-websocket` (~3kb)

Drop-in replacement for the native `WebSocket` API with automatic reconnection, configurable backoff, and message queuing during disconnects.

```ts
import ReconnectingWebSocket from 'reconnecting-websocket';

const ws = new ReconnectingWebSocket('wss://api.example.com/stream', [], {
    minReconnectionDelay: 1_000,
    maxReconnectionDelay: 30_000,
    maxRetries: Infinity,
});

ws.addEventListener('open', () => logger.info('Connected'));
ws.addEventListener('message', (e) => handleMessage(JSON.parse(e.data)));
ws.addEventListener('close', () => logger.info('Disconnected'));

ws.send(JSON.stringify({ type: 'subscribe', channel: 'prices' }));
ws.close(); // clean close, no reconnect
```

---

### `focus-trap` (~2kb)

Constrains keyboard focus within a DOM element. Required for accessible modals, dialogs, and drawers — keyboard users must not be able to tab outside an open overlay.

```ts
import { createFocusTrap } from 'focus-trap';

let trap: ReturnType<typeof createFocusTrap>;

onMount(() => {
    trap = createFocusTrap(modalEl, {
        escapeDeactivates: true,
        returnFocusOnDeactivate: true,
        initialFocus: '#modal-confirm-button',
    });
});

// When modal opens
trap.activate();

// When modal closes
trap.deactivate();
```

---

## Architecture

### State management

Shared state lives in `.ts` files under `src/data/` as module-level Solid signals and stores. Import directly — no providers, no context, no wiring.

```ts
// src/data/data-store.ts
import { createSignal, createStore } from 'solid-js';

export const [counter, setCounter] = createSignal(0);
export const [settings, setSettings] = createStore({ theme: 'dark', language: 'en' });
```

```tsx
// Any component, anywhere
import { counter, settings } from '@/data/data-store';

<p>
    Count: {counter()}, Theme: {settings.theme}
</p>;
```

Use `createSignal` for atomic values. Use `createStore` for objects and arrays that are updated partially — it supports fine-grained nested updates without replacing the whole object.

### Event system

The event bus (`mitt`) handles communication that doesn't belong in the reactive signal graph: lifecycle events, system-level notifications, cross-cutting concerns.

Events are defined in `src/event/` as namespaced constant objects with a corresponding `EventMap` type. This gives full TypeScript inference on both `emit` and `on`.

```ts
// Adding a new event:
// 1. Add the key to base.ts or ui.ts
// 2. Add the payload type to the corresponding EventMap
// 3. AppEvent and EventMap in event.ts pick it up automatically
```

Use `mitt` for events that cross component boundaries without a direct parent-child relationship. Use signals and stores for reactive state that the UI depends on. Use both in the same app — they serve different purposes.

### Component lifecycle

The canonical pattern for components that set up native listeners or subscriptions:

```tsx
onMount(() => {
    // setup
    someSource.addEventListener('event', handler);
    eventBus.on(AppEvent.Something, handler);

    onCleanup(() => {
        // teardown — co-located with setup
        someSource.removeEventListener('event', handler);
        eventBus.off(AppEvent.Something, handler);
    });
});
```

`onCleanup` called inside `onMount` runs when the component is destroyed, keeping setup and teardown together.

### CSS

Plain CSS files colocated with components, processed by `lightningcss`. CSS Modules (`*.module.css`) are available for scoping when class name collisions are a concern.

```tsx
import './Button.css';
// or
import styles from './Button.module.css';
```

Design tokens via CSS custom properties — zero dependency, reactive to JS:

```css
:root {
    --color-accent: #646cff;
    --space-4: 1rem;
    --radius-md: 6px;
}
```

Use `@layer` for cascade management, CSS nesting for component structure. `lightningcss` transpiles both for older targets automatically. No utility framework (Tailwind) is used or recommended.

---

## Development Workflow

```bash
npm run dev          # dev server at localhost:5173
npm run build        # tsc type-check, then vite build to dist/
npm run preview      # serve dist/ at localhost:4173
npm run lint         # eslint
npm run lint:check   # eslint, fail on any warning
npm run format       # prettier write
npm run format:check # prettier check
npm run test         # vitest run
```
