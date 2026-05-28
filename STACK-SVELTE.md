# Stack — Svelte Variant

An alternative to `STACK.md` built around Svelte as the rendering layer. The core philosophy is the same — minimal footprint, tree-shakeability, TypeScript-first — but this variant trades platform proximity for significantly better developer ergonomics and a more cohesive component model.

---

## What Changes and Why

The original stack has no rendering layer. Adding one is the main decision, and **Svelte** is the strongest fit here because:

- Most popular choice among developers building lean, modern, composable UIs
- Compiler-based — ships minimal runtime, no virtual DOM
- Component-scoped CSS built-in, processed by `lightningcss` via `vitePreprocess()`
- No Tailwind needed — Svelte's `<style>` blocks solve style isolation without class verbosity

**Reactivity:** Svelte's runes (`$state`, `$derived`, `$effect`) handle all reactive state — local and shared. Shared state lives in plain `.svelte.ts` files and is imported directly into components. `nanostores` is not needed.

---

## Full Stack

### Build & Tooling

| Package                                                          | Role                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| `vite`                                                           | Dev server and bundler (esbuild + Rollup)                          |
| `@sveltejs/vite-plugin-svelte`                                   | Svelte compiler integration for Vite                               |
| `typescript`                                                     | Type safety                                                        |
| `svelte-check`                                                   | Type checking for `.svelte` files                                  |
| `lightningcss` + `browserslist`                                  | CSS transforms, vendor prefixes, minification (via vitePreprocess) |
| `esbuild`                                                        | JS minification (via Vite)                                         |
| `vitest` + `@testing-library/svelte`                             | Unit and component testing                                         |
| `eslint` + `typescript-eslint` + `eslint-plugin-svelte`          | Linting                                                            |
| `prettier` + `eslint-config-prettier` + `prettier-plugin-svelte` | Formatting                                                         |

### Runtime

| Package         | Role                                                     |
| --------------- | -------------------------------------------------------- |
| `svelte`        | Rendering layer — compiled components, scoped CSS, runes |
| `mitt`          | Typed pub/sub event bus                                  |
| `ky`            | HTTP client (lightweight fetch wrapper)                  |
| `date-fns`      | Date formatting and manipulation                         |
| `lucide-svelte` | Icon set — Svelte-native version of Lucide               |

---

## Recommended Additions

### Router

| Package             | Gzip | Notes                                                                                                                                |
| ------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `svelte-spa-router` | ~6kb | Lightweight client-side router for standalone Svelte SPAs. Component-based route mapping, hash and history mode, typed route params. |

> SvelteKit includes file-based routing but is a full meta-framework (SSR, server functions, etc.) — overkill for a pure client-side SPA.

### Animations

| Package   | Gzip | Notes                                                                                                                                |
| --------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `animejs` | ~6kb | Modular, tree-shakeable animation library. Timeline-based, well-suited to sequenced macro-animations. Lighter than `motion` (~18kb). |

> For micro-animations (hover states, enter/exit transitions), Svelte's built-in `transition:`, `animate:`, and `use:` directives are zero-cost — no library needed.

### WebSocket client

| Package                  | Gzip | Notes                                                                                                             |
| ------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `reconnecting-websocket` | ~3kb | Drop-in replacement for `WebSocket` with auto-reconnect, configurable backoff, and message queuing on disconnect. |

> If connections are short-lived or reconnect logic is server-side, the native `WebSocket` API is sufficient.

### Validation / Schema

| Package   | Gzip        | Notes                                                                                                                                    |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `valibot` | ~1kb (core) | Tree-shakeable TypeScript-first schema validation. Only bundles the validators you use. A lightweight alternative to Zod (~20kb bundle). |

### Floating UI elements

| Package               | Gzip  | Notes                                                                                                              |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| `@floating-ui/svelte` | ~10kb | Svelte-native wrapper around Floating UI. Positioning engine for tooltips, dropdowns, popovers, and context menus. |

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
// Currency / numbers
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5);
// → "$1,234.50"

// Relative time
new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day');
// → "yesterday"

// Lists
new Intl.ListFormat('en', { type: 'conjunction' }).format(['Svelte', 'Vite', 'ky']);
// → "Svelte, Vite, and ky"
```

`date-fns` handles date formatting. Only reach for an additional library if `Intl` is genuinely insufficient.

---

## CSS

Svelte's `<style>` blocks are scoped to the component by the compiler — no class naming conventions or style leakage. `vitePreprocess()` routes these styles through Vite's CSS pipeline, so `lightningcss` applies consistently to both component and global styles.

```svelte
<style>
    /* Scoped to this component. lightningcss processes nesting, custom media, etc. */
    .card {
        padding: var(--space-4);

        & h2 {
            color: var(--color-heading);
        }
    }
</style>
```

Use `:global()` for intentional bleed-out:

```svelte
<style>
    :global(body) {
        margin: 0;
    }
</style>
```

For micro-animations, Svelte's built-in directives cover most cases without any library:

```svelte
<script>
    import { fade, slide } from 'svelte/transition';
</script>

{#if open}
    <div transition:fade={{ duration: 150 }}>...</div>
{/if}
```

- **CSS custom properties** for design tokens — zero dependency, fully reactive to JS.
- **`@layer`** for cascade management — native, zero cost.
- **CSS nesting** — native in all modern browsers; `lightningcss` transpiles for older targets automatically.

No utility-first framework (e.g. Tailwind) is needed or recommended. Svelte's scoped styles solve the same problems — style isolation, colocation, low specificity — without HTML verbosity or an extra dependency.

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

**Svelte-specific notes:**

- Declare `favourites` as `$state` in a `.svelte.ts` module and import it into both `Header` and `PokemonDetail`
- Use `svelte-spa-router` for the two routes — map `/` to `PokemonList` and `/pokemon/:name` to `PokemonDetail`
- Use Svelte's `{#await}` block to handle loading and error states for both fetch calls
- The search filter is local `$state` inside `PokemonList`, used in an `{#each}` block with a `.filter()` on the fetched array

---

## Trade-offs vs the Vanilla Stack

|                  | Vanilla (`STACK.md`)         | Svelte (`STACK-SVELTE.md`)                        |
| ---------------- | ---------------------------- | ------------------------------------------------- |
| Rendering        | None (bring your own)        | Svelte compiler                                   |
| Component model  | Manual DOM / Web Components  | `.svelte` single-file components                  |
| Local state      | Manual                       | Svelte runes (`$state`, `$derived`)               |
| Shared state     | nanostores                   | Svelte runes in `.svelte.ts` files                |
| CSS              | lightningcss on `.css` files | lightningcss on all styles via `vitePreprocess()` |
| Micro-animations | CSS / WAAPI                  | Svelte `transition:` / `animate:` directives      |
| Portability      | High — no framework lock-in  | Medium — components are Svelte-specific           |
| DX               | Explicit, verbose            | Ergonomic, low boilerplate                        |
| Bundle overhead  | Zero runtime                 | ~2–4kb Svelte runtime                             |
