# Stack — Svelte Variant

An alternative to `STACK.md` built around Svelte as the rendering layer. The core philosophy is the same — minimal footprint, tree-shakeability, TypeScript-first — but this variant trades platform proximity for significantly better developer ergonomics and a more cohesive component model.

---

## What Changes and Why

The original stack has no rendering layer. Adding one is the main decision, and **Svelte** is the strongest fit here because:

- Most popular choice among developers building lean, modern, composable UIs
- Compiler-based — ships minimal runtime, no virtual DOM
- Component-scoped CSS built-in, processed by `lightningcss` via `vitePreprocess()`
- `nanostores` has first-class Svelte bindings — the existing data layer carries over cleanly
- No Tailwind needed — Svelte's `<style>` blocks solve style isolation without class verbosity

**Reactivity split:** use Svelte's `$state` / `$derived` runes for local component state, and `nanostores` for shared cross-component state. This is a natural and clean division.

---

## Full Stack

### Build & Tooling

| Package                                              | Role                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `vite`                                               | Dev server and bundler (esbuild + Rollup)                         |
| `@sveltejs/vite-plugin-svelte`                       | Svelte compiler integration for Vite                              |
| `typescript`                                         | Type safety                                                       |
| `svelte-check`                                       | Type checking for `.svelte` files                                 |
| `lightningcss` + `browserslist`                      | CSS transforms, vendor prefixes, minification (via vitePreprocess)|
| `esbuild`                                            | JS minification (via Vite)                                        |
| `vitest` + `@testing-library/svelte`                 | Unit and component testing                                        |
| `eslint` + `typescript-eslint` + `eslint-plugin-svelte` | Linting                                                        |
| `prettier` + `eslint-config-prettier` + `prettier-plugin-svelte` | Formatting                                             |

### Runtime

| Package              | Role                                                              |
| -------------------- | ----------------------------------------------------------------- |
| `svelte`             | Rendering layer — compiled components, scoped CSS, runes          |
| `nanostores`         | Shared reactive state (cross-component atoms and computed stores) |
| `@nanostores/svelte` | Svelte bindings for nanostores                                    |
| `mitt`               | Typed pub/sub event bus                                           |
| `ky`                 | HTTP client (lightweight fetch wrapper)                           |
| `date-fns`           | Date formatting and manipulation                                  |
| `lucide-svelte`      | Icon set — Svelte-native version of Lucide                        |

---

## Recommended Additions

### Router

| Package              | Gzip | Notes                                                                                                                                     |
| -------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `@nanostores/router` | ~1kb | URL routing as nanostores atoms. Integrates with `@nanostores/svelte` — routes are reactive and typed. Zero dependencies.                |

### Animations

| Package   | Gzip  | Notes                                                                                                                                          |
| --------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `animejs` | ~6kb  | Modular, tree-shakeable animation library. Timeline-based, well-suited to sequenced macro-animations. Lighter than `motion` (~18kb).           |

> For micro-animations (hover states, enter/exit transitions), Svelte's built-in `transition:`, `animate:`, and `use:` directives are zero-cost — no library needed.

### WebSocket client

| Package                  | Gzip | Notes                                                                                                             |
| ------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `reconnecting-websocket` | ~3kb | Drop-in replacement for `WebSocket` with auto-reconnect, configurable backoff, and message queuing on disconnect. |

> If connections are short-lived or reconnect logic is server-side, the native `WebSocket` API is sufficient.

### Validation / Schema

| Package   | Gzip        | Notes                                                                                                                                             |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valibot` | ~1kb (core) | Tree-shakeable TypeScript-first schema validation. Only bundles the validators you use. A lightweight alternative to Zod (~20kb bundle).          |

### Floating UI elements

| Package              | Gzip  | Notes                                                                                                                     |
| -------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `@floating-ui/svelte`| ~10kb | Svelte-native wrapper around Floating UI. Positioning engine for tooltips, dropdowns, popovers, and context menus.       |

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
// Currency / numbers
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5);
// → "$1,234.50"

// Relative time
new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day');
// → "yesterday"

// Lists
new Intl.ListFormat('en', { type: 'conjunction' }).format(['Svelte', 'nanostores', 'ky']);
// → "Svelte, nanostores, and ky"
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

## Trade-offs vs the Vanilla Stack

| | Vanilla (`STACK.md`) | Svelte (`STACK-SVELTE.md`) |
|---|---|---|
| Rendering | None (bring your own) | Svelte compiler |
| Component model | Manual DOM / Web Components | `.svelte` single-file components |
| Local state | nanostores or manual | Svelte runes (`$state`, `$derived`) |
| Shared state | nanostores | nanostores + `@nanostores/svelte` |
| CSS | lightningcss on `.css` files | lightningcss on all styles via `vitePreprocess()` |
| Micro-animations | CSS / WAAPI | Svelte `transition:` / `animate:` directives |
| Portability | High — no framework lock-in | Medium — components are Svelte-specific |
| DX | Explicit, verbose | Ergonomic, low boilerplate |
| Bundle overhead | Zero runtime | ~2–4kb Svelte runtime |
