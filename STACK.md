# Stack

Dependency philosophy and recommendations for this template. Everything here prioritizes minimal footprint, tree-shakeability, TypeScript-first design, and platform proximity. No frameworks, no magic — just composable primitives.

---

## Current Stack

### Build & Tooling

| Package                               | Role                                          |
| ------------------------------------- | --------------------------------------------- |
| `vite`                                | Dev server and bundler (esbuild + Rollup)     |
| `typescript`                          | Type safety                                   |
| `lightningcss` + `browserslist`       | CSS transforms, vendor prefixes, minification |
| `esbuild`                             | JS minification (via Vite)                    |
| `vitest`                              | Unit testing                                  |
| `eslint` + `typescript-eslint`        | Linting                                       |
| `prettier` + `eslint-config-prettier` | Formatting                                    |

### Runtime

| Package      | Role                                    |
| ------------ | --------------------------------------- |
| `nanostores` | Reactive atoms and computed stores      |
| `mitt`       | Typed pub/sub event bus                 |
| `ky`         | HTTP client (lightweight fetch wrapper) |
| `date-fns`   | Date formatting and manipulation        |
| `lucide`     | Icon set (tree-shakeable SVGs)          |

---

## Recommended Additions

### Rendering layer

The template has no rendering layer — the right choice depends on how close to the platform you want to stay.

| Package    | Gzip | Notes                                                                                                                                                                                                                                          |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lit`      | ~5kb | Web Components with declarative templates and reactive properties. Framework-agnostic, platform-native, integrates with nanostores naturally. Best choice if you want to build your own reusable components without committing to a framework. |
| `preact`   | ~3kb | React-compatible API at a fraction of the size. Broadest ecosystem compatibility. Pair with nanostores.                                                                                                                                        |
| `solid-js` | ~7kb | Fine-grained signal-based rendering, conceptually close to nanostores. Highest runtime performance of the three.                                                                                                                               |

### Animations

| Package  | Gzip  | Notes                                                                                                                                                                      |
| -------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `motion` | ~18kb | The gold standard for web animations. Vanilla JS build supports spring physics, keyframes, timelines, scroll-driven animations, and gestures. Covers both micro and macro. |

> For micro-animations only (hover states, enter/exit transitions), native CSS transitions and the Web Animations API (`element.animate()`) are sufficient and zero-cost.

### WebSocket client

| Package                  | Gzip | Notes                                                                                                             |
| ------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `reconnecting-websocket` | ~3kb | Drop-in replacement for `WebSocket` with auto-reconnect, configurable backoff, and message queuing on disconnect. |

> If connections are always short-lived and reconnect logic is handled server-side, the native `WebSocket` API is sufficient.

### Router

| Package              | Gzip | Notes                                                                                                                                       |
| -------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nanostores/router` | ~1kb | URL routing as nanostores atoms. Zero dependencies, integrates perfectly with the existing data layer. Route params are typed and reactive. |

### Validation / Schema

| Package   | Gzip        | Notes                                                                                                                                             |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valibot` | ~1kb (core) | Tree-shakeable TypeScript-first schema validation. Only bundles the validators you actually use. A lightweight alternative to Zod (~20kb bundle). |

### Floating UI elements

| Package            | Gzip  | Notes                                                                                                                                                |
| ------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@floating-ui/dom` | ~10kb | Positioning engine for tooltips, dropdowns, popovers, and context menus. Framework-agnostic, handles overflow, flipping, and shifting automatically. |

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
new Intl.ListFormat('en', { type: 'conjunction' }).format(['TypeScript', 'Vite', 'nanostores']);
// → "TypeScript, Vite, and nanostores"
```

`date-fns` handles date formatting. Only reach for an additional library if `Intl` is genuinely insufficient.

---

## CSS

`lightningcss` handles modern syntax, nesting, vendor prefixes, and minification. Use the platform:

- **CSS custom properties** for design tokens — zero dependency, fully reactive to JS.
- **`@layer`** for cascade management — native, zero cost.
- **CSS nesting** — native in all modern browsers; `lightningcss` transpiles for older targets automatically.

No utility-first framework (e.g. Tailwind) is included by design. It is a valid choice for content-heavy or team-heavy projects, but adds a build step, class verbosity, and a learning curve. Prefer it consciously, not by default.
