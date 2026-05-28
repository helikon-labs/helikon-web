# CSS Guide

CSS architecture and patterns for this stack. Processed by `lightningcss` — no Tailwind, no CSS-in-JS, no runtime style injection. Just platform CSS with modern syntax transpiled to target browsers.

---

## How lightningcss fits in

`lightningcss` is wired into Vite as the CSS transformer and minifier. It runs on every `.css` file imported into the app, and on all component-scoped CSS Modules.

What it handles automatically based on the `browserslist` target:

- CSS nesting → flat selectors for older targets
- `oklch()` / `lab()` / `color-mix()` → `rgb()` fallbacks
- Logical properties (`margin-inline`, `padding-block`) → physical properties
- Vendor prefixes (`-webkit-`, `-moz-`)
- Minification in production builds

What requires explicit opt-in in `vite.config.ts`:

- `@custom-media` queries (draft spec)

### Enabling `@custom-media`

Add `drafts` to the lightningcss config:

```ts
// vite.config.ts
css: {
    transformer: 'lightningcss',
    lightningcss: {
        targets: browserslistToTargets(browsers),
        drafts: {
            customMedia: true,
        },
    },
},
```

---

## Styles directory structure

```
src/styles/
  style.css         # Root — @layer declarations, @import chain, global resets
  tokens.css        # All CSS custom properties (design tokens)
  base.css          # Element-level styles (body, a, h1, code, input, etc.)
  breakpoints.css   # @custom-media breakpoint definitions
```

Component styles live alongside their component file and are imported from the `.tsx`:

```
src/components/
  Button/
    Button.tsx
    Button.css          # plain CSS, or:
    Button.module.css   # CSS Modules for scoped class names
```

---

## Design tokens

All design decisions live as CSS custom properties in `tokens.css`. Define once, use everywhere. Custom properties are reactive to JavaScript and inherit through the DOM — including into dynamically applied themes.

```css
/* src/styles/tokens.css */

:root {
    /* --- Colors (oklch — perceptually uniform) --- */
    --color-bg: oklch(10% 0 0);
    --color-surface: oklch(15% 0 0);
    --color-surface-raised: oklch(19% 0 0);
    --color-border: oklch(25% 0 0);
    --color-text: oklch(87% 0 0);
    --color-text-muted: oklch(55% 0 0);
    --color-accent: oklch(65% 0.18 264);
    --color-accent-hover: color-mix(in oklch, var(--color-accent), white 12%);
    --color-accent-muted: color-mix(in oklch, var(--color-accent), transparent 75%);
    --color-danger: oklch(60% 0.2 25);
    --color-success: oklch(65% 0.18 145);
    --color-warning: oklch(75% 0.18 80);

    /* --- Spacing scale (4pt base) --- */
    --space-1: 0.25rem; /*  4px */
    --space-2: 0.5rem; /*  8px */
    --space-3: 0.75rem; /* 12px */
    --space-4: 1rem; /* 16px */
    --space-5: 1.25rem; /* 20px */
    --space-6: 1.5rem; /* 24px */
    --space-8: 2rem; /* 32px */
    --space-10: 2.5rem; /* 40px */
    --space-12: 3rem; /* 48px */
    --space-16: 4rem; /* 64px */

    /* --- Typography --- */
    --font-sans: system-ui, -apple-system, sans-serif;
    --font-mono: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;

    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;

    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;

    --leading-tight: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.75;

    /* --- Radii --- */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;

    /* --- Shadows --- */
    --shadow-sm: 0 1px 3px oklch(0% 0 0 / 30%);
    --shadow-md: 0 4px 12px oklch(0% 0 0 / 40%);
    --shadow-lg: 0 8px 24px oklch(0% 0 0 / 50%);

    /* --- Transitions --- */
    --duration-fast: 100ms;
    --duration-normal: 200ms;
    --duration-slow: 350ms;
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-inout: cubic-bezier(0.4, 0, 0.2, 1);

    /* --- Z-index scale --- */
    --z-base: 0;
    --z-raised: 10;
    --z-dropdown: 100;
    --z-overlay: 200;
    --z-modal: 300;
    --z-toast: 400;
}
```

### Light theme override

Override only what changes:

```css
@media (prefers-color-scheme: light) {
    :root {
        --color-bg: oklch(98% 0 0);
        --color-surface: oklch(93% 0 0);
        --color-surface-raised: oklch(88% 0 0);
        --color-border: oklch(80% 0 0);
        --color-text: oklch(15% 0 0);
        --color-text-muted: oklch(50% 0 0);
        --shadow-sm: 0 1px 3px oklch(0% 0 0 / 10%);
        --shadow-md: 0 4px 12px oklch(0% 0 0 / 15%);
        --shadow-lg: 0 8px 24px oklch(0% 0 0 / 20%);
    }
}
```

For JS-driven theme switching (responding to `AppEvent.UI.Theme.Change`), apply a `data-theme` attribute to `<html>` and target it instead of `@media`:

```css
:root,
[data-theme='dark'] {
    --color-bg: oklch(10% 0 0);
    /* ... */
}

[data-theme='light'] {
    --color-bg: oklch(98% 0 0);
    /* ... */
}
```

```ts
// In your theme change handler
document.documentElement.setAttribute('data-theme', newTheme);
```

---

## `@layer` cascade management

Layers give explicit control over override order, eliminating specificity conflicts. Higher layers always win regardless of selector specificity.

```css
/* src/styles/style.css */
@layer reset, tokens, base, components;

@import './tokens.css' layer(tokens);
@import './base.css' layer(base);
@import './breakpoints.css';
```

Component CSS files declare their layer at the top:

```css
/* Button.css */
@layer components {
    .button { ... }
}
```

With layers in place, a `.button` rule in `components` will always override an element-level `button` rule in `base`, no specificity games required.

---

## `@custom-media` breakpoints

Define breakpoints once, reference by name everywhere. Requires `drafts: { customMedia: true }` in `vite.config.ts`.

```css
/* src/styles/breakpoints.css */
@custom-media --mobile (width < 640px);
@custom-media --tablet (640px <= width < 1024px);
@custom-media --desktop (width >= 1024px);
@custom-media --wide (width >= 1280px);

@custom-media --motion-ok (prefers-reduced-motion: no-preference);
@custom-media --touch (hover: none) and (pointer: coarse);
@custom-media --dark (prefers-color-scheme: dark);
@custom-media --light (prefers-color-scheme: light);
```

Usage:

```css
.sidebar {
    width: 240px;

    @media (--mobile) {
        display: none;
    }
}

.button {
    transition: background var(--duration-normal) var(--ease-out);

    @media not (--motion-ok) {
        transition: none;
    }
}
```

---

## CSS nesting

lightningcss transpiles native CSS nesting for older targets. Use it freely.

```css
@layer components {
    .card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        box-shadow: var(--shadow-sm);
        transition: box-shadow var(--duration-normal) var(--ease-out);

        &:hover {
            box-shadow: var(--shadow-md);
        }

        & .card-title {
            font-size: var(--text-lg);
            font-weight: var(--font-semibold);
            color: var(--color-text);
            margin: 0 0 var(--space-2);
        }

        & .card-body {
            color: var(--color-text-muted);
            font-size: var(--text-sm);
            line-height: var(--leading-relaxed);
        }

        &.card--highlighted {
            border-color: var(--color-accent);
            box-shadow:
                0 0 0 1px var(--color-accent-muted),
                var(--shadow-md);
        }
    }
}
```

---

## CSS Modules

Use when generic class names risk colliding across components (`.title`, `.label`, `.icon`, `.content`). Vite generates scoped names automatically — no naming conventions required.

```tsx
// Card.tsx
import styles from './Card.module.css';

export function Card(props: { title: string; body: string }) {
    return (
        <div class={styles.card}>
            <h2 class={styles.title}>{props.title}</h2>
            <p class={styles.body}>{props.body}</p>
        </div>
    );
}
```

```css
/* Card.module.css — no @layer needed, scoping is handled by the generated names */
.card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
}

.title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    margin: 0 0 var(--space-2);
}

.body {
    color: var(--color-text-muted);
}
```

Tokens (`var(--...)`) still work inside modules — they're global by design.

For conditional classes in Solid, use a helper or template literal:

```tsx
<div class={`${styles.card} ${props.highlighted ? styles.highlighted : ''}`}>
```

Or install `clsx` (~0.5kb) for cleaner conditional class composition:

```tsx
import clsx from 'clsx';
<div class={clsx(styles.card, props.highlighted && styles.highlighted)}>
```

---

## Color with `oklch`

`oklch(lightness% chroma hue)` is perceptually uniform — a step of 10% in lightness looks the same across all hues. Use it for all color definitions. lightningcss generates `rgb()` fallbacks for older browsers.

```css
/* Adjust lightness to get tints/shades of the same hue */
--color-accent: oklch(65% 0.18 264);
--color-accent-light: oklch(75% 0.18 264); /* lighter */
--color-accent-dark: oklch(50% 0.18 264); /* darker  */

/* Use color-mix() to derive hover, disabled, muted states */
--color-accent-hover: color-mix(in oklch, var(--color-accent), white 12%);
--color-accent-disabled: color-mix(in oklch, var(--color-accent), transparent 60%);
--color-accent-subtle: color-mix(in oklch, var(--color-accent), var(--color-bg) 85%);
```

Useful `oklch` reference values:

- `chroma 0` → grey
- `chroma 0.1–0.15` → muted/pastel
- `chroma 0.18–0.25` → vivid/saturated
- `hue 0–30` → reds, `60–90` → yellows, `120–150` → greens, `220–280` → blues/purples

---

## Solid-specific notes

- Use `class` not `className` in JSX — Solid uses the DOM attribute directly
- Use `ref` to get a DOM element reference for imperative style changes:

```tsx
let el!: HTMLDivElement;

onMount(() => {
    el.style.setProperty('--offset', `${computedOffset}px`);
});

<div ref={el} class={styles.panel}>
    ...
</div>;
```

- Reactive styles via signals — assign to `style` as an object:

```tsx
const [opacity, setOpacity] = createSignal(1);

<div style={{ opacity: opacity(), transition: 'opacity 200ms' }}>
```

- For CSS custom property updates driven by signals, prefer `el.style.setProperty()` in an effect over inline `style` — it keeps the reactive logic close to the element without polluting JSX with style objects.
