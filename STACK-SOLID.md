# Stack — Solid Variant

An alternative to `STACK.md` built around Solid.js as the rendering layer. This variant targets developers who want the highest possible runtime performance and a signals-first reactivity model, without the overhead of a virtual DOM.

---

## What Changes and Why

**Solid.js** is the right choice when runtime performance and fine-grained reactivity are the priority:

- No virtual DOM — the compiler transforms JSX directly into targeted DOM updates
- Fine-grained signals: only the exact DOM nodes that depend on a changed value re-render
- `createSignal` and `createStore` cover both local and shared state — `nanostores` is not needed
- `@solidjs/router` is the official first-party router, lightweight and well-integrated
- Conceptually the closest to nanostores' own atom model, making the mental model familiar

**Reactivity:** use `createSignal` for simple local values, `createStore` for structured shared state. Module-level signals and stores are shared across the app without any context or provider boilerplate.

---

## Full Stack

### Build & Tooling

| Package                                         | Role                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `vite` + `vite-plugin-solid`                    | Dev server, bundler, and Solid JSX compiler                       |
| `typescript`                                    | Type safety                                                       |
| `lightningcss` + `browserslist`                 | CSS transforms, vendor prefixes, minification                     |
| `esbuild`                                       | JS minification (via Vite)                                        |
| `vitest` + `@solidjs/testing-library`           | Unit and component testing                                        |
| `eslint` + `typescript-eslint` + `eslint-plugin-solid` | Linting                                                   |
| `prettier` + `eslint-config-prettier`           | Formatting                                                        |

### Runtime

| Package            | Role                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `solid-js`         | Rendering layer — fine-grained reactive JSX, no virtual DOM       |
| `@solidjs/router`  | Official first-party router — nested routes, lazy loading, typed  |
| `mitt`             | Typed pub/sub event bus for non-signal communication              |
| `ky`               | HTTP client (lightweight fetch wrapper)                           |
| `date-fns`         | Date formatting and manipulation                                  |
| `lucide-solid`     | Icon set — Solid-native version of Lucide                         |

---

## Recommended Additions

### Animations

| Package   | Gzip | Notes                                                                                                                               |
| --------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `animejs` | ~6kb | Modular, tree-shakeable animation library. Works directly on DOM elements — compatible with Solid's direct-DOM rendering approach.  |

> For simple micro-animations, CSS transitions are zero-cost. Solid's `<Transition>` and `<TransitionGroup>` components handle enter/exit animations natively.

### WebSocket client

| Package                  | Gzip | Notes                                                                                                             |
| ------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `reconnecting-websocket` | ~3kb | Drop-in replacement for `WebSocket` with auto-reconnect, configurable backoff, and message queuing on disconnect. |

### Validation / Schema

| Package   | Gzip        | Notes                                                                                                                                    |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `valibot` | ~1kb (core) | Tree-shakeable TypeScript-first schema validation. Only bundles the validators you use. A lightweight alternative to Zod (~20kb bundle). |

### Floating UI elements

| Package            | Gzip  | Notes                                                                                                                               |
| ------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `@floating-ui/dom` | ~10kb | Framework-agnostic positioning engine for tooltips, dropdowns, and popovers. Works well with Solid's direct DOM element references. |

---

## Optional / Situational

| Package      | Gzip  | Role                              | When to add                                                                                   |
| ------------ | ----- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `virtua`     | ~3kb  | Virtual list and grid rendering   | Long scrollable lists (1,000+ items) where DOM count affects performance                      |
| `micromark`  | ~10kb | Markdown parsing and rendering    | When rendering user-generated or CMS content as markdown                                      |
| `focus-trap` | ~2kb  | Focus trapping for modals/dialogs | Accessible modal and dialog implementation                                                    |
| `open-props` | ~5kb  | CSS custom property design tokens | When you want a consistent spacing, colour, and type scale out of the box without a framework |

---

## Text and Number Formatting

The native `Intl` API covers most formatting needs without any dependency:

```ts
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5);
// → "$1,234.50"

new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day');
// → "yesterday"

new Intl.ListFormat('en', { type: 'conjunction' }).format(['Solid', 'Vite', 'ky']);
// → "Solid, Vite, and ky"
```

`date-fns` handles date formatting. Only reach for an additional library if `Intl` is genuinely insufficient.

---

## CSS

Solid uses standard CSS — no Shadow DOM, no scoped styles out of the box. Component styles are typically colocated as plain `.css` files or CSS modules, all processed by `lightningcss`.

```tsx
// PokemonCard.tsx
import './PokemonCard.css';

export function PokemonCard(props: { name: string }) {
    return <div class="pokemon-card"><h2>{props.name}</h2></div>;
}
```

**CSS Modules** are supported natively by Vite and provide scoping without a framework:

```tsx
import styles from './PokemonCard.module.css';

export function PokemonCard(props: { name: string }) {
    return <div class={styles.card}><h2>{props.name}</h2></div>;
}
```

- **CSS custom properties** for design tokens — zero dependency, fully reactive to JS.
- **`@layer`** for cascade management — native, zero cost.
- **CSS nesting** — native in all modern browsers; `lightningcss` transpiles for older targets automatically.

No utility-first framework (e.g. Tailwind) is needed or recommended for this stack.

---

## Implementation Task: Pokédex Mini

A deliberately simple two-route SPA designed to exercise the core characteristics of each stack variant: component model, local state, shared state, HTTP fetching, and routing. Build it, then compare how each framework handles the same problems.

**Routes:**
- `/` — List view: fetch the first 50 Pokémon, display as a card grid, filter by name in real-time
- `/pokemon/:name` — Detail view: sprite, types, and base stats with a Favourite toggle

**Components:**
1. `Header` — app title and a live badge showing the count of favourited Pokémon (reads shared state)
2. `PokemonList` — fetches the list via `ky`, renders `PokemonCard` per result; text input filters in real-time (local state)
3. `PokemonCard` — sprite thumbnail, name, link to detail route
4. `PokemonDetail` — fetches full Pokémon data; Favourite toggle reads and writes shared state

**Shared state:** a set of favourited Pokémon names — written and read by `PokemonDetail`, read as a count by `Header`.

**API (no auth required):**
```
GET https://pokeapi.co/api/v2/pokemon?limit=50
GET https://pokeapi.co/api/v2/pokemon/:name
```

**Solid-specific notes:**
- Declare `favourites` as a module-level `createStore` or `createSignal<Set<string>>` and import it directly into `Header` and `PokemonDetail` — no provider needed
- Use `@solidjs/router` with `<Route>` components; access the `:name` param via `useParams()`
- Use Solid's built-in `createResource` for both fetch calls — it handles loading/error states and integrates with `<Suspense>` for clean loading UI
- The search filter is a `createSignal` inside `PokemonList`, used in a `<For>` loop with a filter on the resource data

---

## Trade-offs vs the Vanilla Stack

|                  | Vanilla (`STACK.md`)          | Solid (`STACK-SOLID.md`)                          |
| ---------------- | ----------------------------- | ------------------------------------------------- |
| Rendering        | None (bring your own)         | Solid compiler + ~7kb runtime                     |
| Component model  | Manual DOM                    | JSX function components — no classes              |
| Local state      | Manual                        | `createSignal` — fine-grained, no re-render overhead |
| Shared state     | nanostores                    | Module-level `createSignal` / `createStore`       |
| CSS              | lightningcss on `.css` files  | Same — or CSS Modules for scoping                 |
| Micro-animations | CSS / WAAPI                   | CSS + `<Transition>` component                    |
| Portability      | High — no framework           | Low — JSX and signals are Solid-specific          |
| DX               | Explicit                      | Excellent — familiar JSX, simpler than React      |
| Bundle overhead  | Zero runtime                  | ~7kb Solid runtime                                |
