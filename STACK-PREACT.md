# Stack — Preact Variant

An alternative to `STACK.md` built around Preact as the rendering layer. This variant is the right choice when React ecosystem compatibility matters — Preact's API is largely React-compatible, giving access to a vast library of existing components and hooks at a fraction of React's bundle size.

---

## What Changes and Why

**Preact** (~3kb gzip) is the leanest rendering option of the four variants:

- React-compatible API — most React libraries work via `preact/compat`
- `@preact/signals` provides a lightweight signals system for reactivity, covering both local and shared state
- `preact-iso` from the Preact team bundles lightweight client-side routing and lazy loading
- No compiler required beyond standard JSX transformation — straightforward Vite setup

**Reactivity:** use `@preact/signals` for all reactive state. Module-level `signal()` values serve as shared state; component-local `signal()` values replace `useState`. Signals integrate directly into JSX — no hook wrappers needed.

---

## Full Stack

### Build & Tooling

| Package                                         | Role                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `vite` + `@preact/preset-vite`                  | Dev server, bundler, and Preact JSX configuration                 |
| `typescript`                                    | Type safety                                                       |
| `lightningcss` + `browserslist`                 | CSS transforms, vendor prefixes, minification                     |
| `esbuild`                                       | JS minification (via Vite)                                        |
| `vitest` + `@testing-library/preact`            | Unit and component testing                                        |
| `eslint` + `typescript-eslint`                  | Linting                                                           |
| `prettier` + `eslint-config-prettier`           | Formatting                                                        |

### Runtime

| Package             | Role                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `preact`            | Rendering layer — virtual DOM, JSX, hooks                         |
| `@preact/signals`   | Fine-grained signals for local and shared reactive state          |
| `preact-iso`        | Lightweight client-side routing and lazy loading                  |
| `mitt`              | Typed pub/sub event bus for non-signal communication              |
| `ky`                | HTTP client (lightweight fetch wrapper)                           |
| `date-fns`          | Date formatting and manipulation                                  |
| `lucide`            | Icon set — use lucide-react via `preact/compat`, or import SVGs directly |

---

## Recommended Additions

### Animations

| Package   | Gzip | Notes                                                                                                          |
| --------- | ---- | -------------------------------------------------------------------------------------------------------------- |
| `animejs` | ~6kb | Modular, tree-shakeable animation library. Timeline-based, works directly on DOM element refs.                 |

> For micro-animations, CSS transitions are zero-cost. Preact has no built-in transition system — reach for `animejs` or the Web Animations API for enter/exit.

### WebSocket client

| Package                  | Gzip | Notes                                                                                                             |
| ------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `reconnecting-websocket` | ~3kb | Drop-in replacement for `WebSocket` with auto-reconnect, configurable backoff, and message queuing on disconnect. |

### Validation / Schema

| Package   | Gzip        | Notes                                                                                                                                    |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `valibot` | ~1kb (core) | Tree-shakeable TypeScript-first schema validation. Only bundles the validators you use. A lightweight alternative to Zod (~20kb bundle). |

### Floating UI elements

| Package            | Gzip  | Notes                                                                                                                                        |
| ------------------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `@floating-ui/dom` | ~10kb | Framework-agnostic positioning engine. Use with `useRef` and `useEffect` to wire up tooltip and dropdown positioning.                        |

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

new Intl.ListFormat('en', { type: 'conjunction' }).format(['Preact', 'Vite', 'ky']);
// → "Preact, Vite, and ky"
```

`date-fns` handles date formatting. Only reach for an additional library if `Intl` is genuinely insufficient.

---

## CSS

Preact uses standard CSS — no Shadow DOM, no scoped styles out of the box. Colocate styles as plain `.css` files or CSS Modules, all processed by `lightningcss`.

```tsx
// PokemonCard.tsx
import './PokemonCard.css';

export function PokemonCard({ name }: { name: string }) {
    return <div class="pokemon-card"><h2>{name}</h2></div>;
}
```

**CSS Modules** are supported natively by Vite and provide component-level scoping:

```tsx
import styles from './PokemonCard.module.css';

export function PokemonCard({ name }: { name: string }) {
    return <div class={styles.card}><h2>{name}</h2></div>;
}
```

> Note: Preact uses `class` instead of React's `className` — this is one of the small API differences to be aware of when adapting React code.

- **CSS custom properties** for design tokens — zero dependency, fully reactive to JS.
- **`@layer`** for cascade management — native, zero cost.
- **CSS nesting** — native in all modern browsers; `lightningcss` transpiles for older targets automatically.

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

**Preact-specific notes:**
- Declare `favourites` as a module-level `signal<Set<string>>(new Set())` from `@preact/signals` and import it into both `Header` and `PokemonDetail` — signals update the DOM directly, no re-render of the whole component
- Use `preact-iso`'s `<Router>` and `<Route>` for the two views; access `:name` via the route's `params` prop
- Handle fetch state with a local `signal` for the fetched data and a `signal<boolean>` for loading, updated inside a `useEffect`
- The search filter is a local `signal('')` inside `PokemonList`, used to filter the fetched array in the JSX expression

---

## Trade-offs vs the Vanilla Stack

|                  | Vanilla (`STACK.md`)          | Preact (`STACK-PREACT.md`)                        |
| ---------------- | ----------------------------- | ------------------------------------------------- |
| Rendering        | None (bring your own)         | Virtual DOM — ~3kb runtime                        |
| Component model  | Manual DOM                    | JSX function components — React-compatible        |
| Local state      | Manual                        | `signal()` from `@preact/signals`                 |
| Shared state     | nanostores                    | Module-level `signal()` from `@preact/signals`    |
| CSS              | lightningcss on `.css` files  | Same — or CSS Modules for scoping                 |
| Micro-animations | CSS / WAAPI                   | CSS + animejs / WAAPI — no built-in transitions   |
| Portability      | High — no framework           | Low — JSX components are Preact-specific          |
| React ecosystem  | None                          | Full access via `preact/compat`                   |
| DX               | Explicit                      | Familiar — React knowledge transfers directly     |
| Bundle overhead  | Zero runtime                  | ~3kb Preact + ~5kb signals                        |
