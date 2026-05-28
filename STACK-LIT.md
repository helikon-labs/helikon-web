# Stack — Lit Variant

An alternative to `STACK.md` built around Lit as the rendering layer. This variant prioritises maximum platform proximity — components are true Web Components, runnable in any browser context without a framework. The trade-off is more explicit wiring and a higher boilerplate floor than Svelte or Solid.

---

## What Changes and Why

**Lit** is the pragmatic choice when portability and platform-nativeness are the primary goals:

- Produces true Web Components (Custom Elements + Shadow DOM) — usable in any framework or none
- No compiler required — a runtime library (~5kb gzip), not a build-time transform
- Reactive properties via decorators (`@property`, `@state`) with efficient DOM updates via tagged template literals
- `nanostores` fills the shared state gap that Lit deliberately does not address — subscribe manually in `connectedCallback` / `disconnectedCallback`
- No Tailwind needed — Shadow DOM provides true style encapsulation per component

**Reactivity split:** use Lit's `@state()` decorator for local component state, and `nanostores` atoms for shared cross-component state.

---

## Full Stack

### Build & Tooling

| Package                                              | Role                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `vite`                                               | Dev server and bundler (esbuild + Rollup)                        |
| `typescript`                                         | Type safety                                                      |
| `lightningcss` + `browserslist`                      | CSS transforms, vendor prefixes, minification (global CSS files) |
| `esbuild`                                            | JS minification (via Vite)                                       |
| `vitest`                                             | Unit testing                                                     |
| `eslint` + `typescript-eslint` + `eslint-plugin-lit` | Linting                                                          |
| `prettier` + `eslint-config-prettier`                | Formatting                                                       |

> `lightningcss` applies to global `.css` files. Component styles live inside Shadow DOM via Lit's `static styles` and are not processed by `lightningcss`. Use CSS custom properties to bridge the two.

### Runtime

| Package              | Role                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `lit`                | Rendering layer — Web Components, reactive templates, Shadow DOM |
| `nanostores`         | Shared reactive state (atoms and computed stores)                |
| `@nanostores/router` | URL routing as nanostores atoms — integrates naturally           |
| `mitt`               | Typed pub/sub event bus for non-component communication          |
| `ky`                 | HTTP client (lightweight fetch wrapper)                          |
| `date-fns`           | Date formatting and manipulation                                 |
| `lucide`             | Icon set — import and render SVG strings directly                |

> There is no official `@nanostores/lit` package. Subscribe to atoms manually:
>
> ```ts
> connectedCallback() {
>     super.connectedCallback();
>     this.unsub = myAtom.subscribe(value => { this.localValue = value; });
> }
> disconnectedCallback() {
>     super.disconnectedCallback();
>     this.unsub();
> }
> ```

---

## Recommended Additions

### Animations

| Package   | Gzip | Notes                                                                                                                      |
| --------- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| `animejs` | ~6kb | Modular, tree-shakeable animation library. Works directly against DOM elements — a natural fit for Lit's imperative style. |

> For simple micro-animations, CSS transitions inside Shadow DOM `static styles` are zero-cost.

### WebSocket client

| Package                  | Gzip | Notes                                                                                                             |
| ------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `reconnecting-websocket` | ~3kb | Drop-in replacement for `WebSocket` with auto-reconnect, configurable backoff, and message queuing on disconnect. |

### Validation / Schema

| Package   | Gzip        | Notes                                                                                                                                    |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `valibot` | ~1kb (core) | Tree-shakeable TypeScript-first schema validation. Only bundles the validators you use. A lightweight alternative to Zod (~20kb bundle). |

### Floating UI elements

| Package            | Gzip  | Notes                                                                                                                          |
| ------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| `@floating-ui/dom` | ~10kb | Framework-agnostic positioning engine. Works directly with DOM elements — straightforward to use inside Lit component methods. |

---

## Optional / Situational

| Package             | Gzip  | Role                              | When to add                                                                                   |
| ------------------- | ----- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `@nanostores/query` | ~2kb  | Query + mutation state management | When HTTP requests need caching, deduplication, or loading/error state                        |
| `@nanostores/i18n`  | ~2kb  | Internationalisation              | Multi-language support; integrates with the existing nanostores layer                         |
| `virtua`            | ~3kb  | Virtual list and grid rendering   | Long scrollable lists (1,000+ items) where DOM count affects performance                      |
| `micromark`         | ~10kb | Markdown parsing and rendering    | When rendering user-generated or CMS content as markdown                                      |
| `focus-trap`        | ~2kb  | Focus trapping for modals/dialogs | Accessible modal and dialog implementation                                                    |
| `open-props`        | ~5kb  | CSS custom property design tokens | When you want a consistent spacing, colour, and type scale out of the box without a framework |

---

## Text and Number Formatting

The native `Intl` API covers most formatting needs without any dependency:

```ts
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5);
// → "$1,234.50"

new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day');
// → "yesterday"

new Intl.ListFormat('en', { type: 'conjunction' }).format(['Lit', 'Vite', 'ky']);
// → "Lit, Vite, and ky"
```

`date-fns` handles date formatting. Only reach for an additional library if `Intl` is genuinely insufficient.

---

## CSS

Lit components use Shadow DOM, which means their internal styles are fully isolated — global CSS cannot penetrate them and component styles cannot leak out. This is stronger isolation than Svelte's scoped styles, but requires a deliberate approach to theming.

**Styles live in the component class:**

```ts
import { LitElement, html, css } from 'lit';

class PokemonCard extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: var(--space-4);
        }
        h2 {
            color: var(--color-heading);
        }
    `;

    render() {
        return html`<h2>${this.name}</h2>`;
    }
}
```

**Theming via CSS custom properties** — the only way to bridge the Shadow DOM boundary from global CSS:

```css
/* global.css — processed by lightningcss */
:root {
    --color-heading: #1a1a1a;
    --space-4: 1rem;
}
```

Custom properties inherit through Shadow DOM boundaries, making them the standard theming primitive for Web Components.

**Global CSS** (outside components) is still processed by `lightningcss` as normal.

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

**Lit-specific notes:**

- Declare a `favourites` nanostores atom in a shared module; subscribe to it in `Header` and `PokemonDetail` via `connectedCallback` / `disconnectedCallback`
- Use `@nanostores/router` for the two routes — check the current route atom in your root component and conditionally render `<pokemon-list>` or `<pokemon-detail>`
- Handle fetch loading state with a `@state() loading` boolean and a conditional in the `render()` template
- The search filter is a `@state() filter` string inside `PokemonList`, used to filter the fetched array before rendering

---

## Trade-offs vs the Vanilla Stack

|                  | Vanilla (`STACK.md`)         | Lit (`STACK-LIT.md`)                                |
| ---------------- | ---------------------------- | --------------------------------------------------- |
| Rendering        | None (bring your own)        | Lit runtime (~5kb)                                  |
| Component model  | Manual DOM                   | Web Components — true Custom Elements               |
| Local state      | Manual                       | `@state()` decorator — reactive and efficient       |
| Shared state     | nanostores                   | nanostores — same, manual subscription              |
| CSS              | lightningcss on `.css` files | Shadow DOM per component + lightningcss for global  |
| Theming          | CSS custom properties        | CSS custom properties (only option across boundary) |
| Micro-animations | CSS / WAAPI                  | CSS inside Shadow DOM / animejs for complex         |
| Portability      | High — no framework          | Highest — true Web Components, zero lock-in         |
| DX               | Explicit                     | More explicit — high boilerplate floor              |
| Bundle overhead  | Zero runtime                 | ~5kb Lit runtime                                    |
