# Code Review: helikon-web v2

This is a review of the v2 template. The foundation is solid — good tooling choices, a clean event system design, and proper HMR setup — but there are a handful of real bugs and consistency issues worth addressing before building on top of this.

---

## Bugs / Correctness Issues

### 1. `UIEvent.Layout.Expand` missing from `UIEventMap`

**File:** `src/event/ui.ts`

`Expand` is defined in the `UIEvent` constant object but has no corresponding entry in `UIEventMap`. This means `mitt` cannot enforce type safety when emitting or listening for that event — it falls through as `never`.

```ts
// UIEvent constant has Expand defined:
Expand: 'ui:layout:expand',

// But UIEventMap is missing the entry:
[UIEvent.Layout.Expand]: { panel: string }; // or whatever the payload should be
```

### 2. `setTimeout` handles are never cleared in `stop()`

**File:** `src/app.ts:57–65`

Two `setTimeout` calls are fired in `start()`. In `stop()` — which is called during HMR dispose — those timers are never cancelled. If `stop()` is called before they fire, the events still emit into the already torn-down bus. The timer IDs should be stored and `clearTimeout()` called in `stop()`.

```ts
// In start():
this.timers.push(setTimeout(() => { ... }, 2500));
this.timers.push(setTimeout(() => { ... }, 5000));

// In stop():
for (const timer of this.timers) {
    clearTimeout(timer);
}
this.timers = [];
```

### 3. `app.start()` is not awaited in `bootstrap()`

**File:** `src/main.ts:9`

`start()` is `async`, but the call in `bootstrap()` is neither awaited nor given a `.catch()` handler. Any error thrown asynchronously inside `start()` becomes a silently dropped unhandled promise rejection.

```ts
// Currently:
app.start();

// Should be:
app.start().catch((err) => logger.error('App failed to start:', err));
```

---

## Code Quality / Consistency

### 4. Counter state is split between two independent systems

**Files:** `src/counter.ts`, `src/data/data-store.ts`, `src/app.ts`

`setupCounter()` maintains its own local `counter` variable in a closure. The `$counter` atom in the data store exists separately. They are never synchronised:

- Clicking the button does **not** update `$counter`.
- `$counter.set(...)` in the `setTimeout` does **not** update the button text.

As a template, this is misleading — it implies a pattern that doesn't actually work end-to-end. Either wire `setupCounter` to use the atom directly, or remove one of the two mechanisms.

### 5. Inconsistent event access pattern in the same file

**File:** `src/app.ts:50, 64`

```ts
// Line 50 — accesses via UIEvent directly:
eventBus.on(UIEvent.Layout.Resize, this.onLayoutChange);

// Line 64 — accesses via AppEvent.UI:
eventBus.emit(AppEvent.UI.Layout.Resize, { width: 1920, height: 1080 });
```

Both resolve to the same string at runtime, but using two different access paths in the same file is a footgun. Since `AppEvent` is the intended unified API, `UIEvent` shouldn't need to be imported in `app.ts` at all — use `AppEvent.UI.*` consistently throughout.

### 6. Event handler `this` binding is a potential footgun

**File:** `src/app.ts:48–50, 73–75`

```ts
eventBus.on(AppEvent.Ping, this.onPing);
```

This works today only because none of the handlers reference `this`. The moment any handler needs `this.something`, it will break silently at runtime — the method reference loses its binding when passed as a callback. Arrow function class properties fix both binding and the `on`/`off` reference identity problem `mitt` requires:

```ts
private onPing = async (): Promise<void> => {
    logger.info('Pong.');
};
```

### 7. `.js` extension in test import is inconsistent

**File:** `src/sum.test.ts:2`

```ts
import { sum } from './sum.js';
```

Every other import in the codebase omits the extension. This is technically valid for ESNext resolution (TypeScript maps `.js` to `.ts`), but it is visually inconsistent. It should match the rest of the codebase:

```ts
import { sum } from './sum';
```

---

## Minor / Cleanup

### 8. Placeholder content in `index.html`

- The page `<title>` is `"Vite + TS"` — should be updated to the real project name.
- The favicon references `/vite.svg` — the Vite logo placeholder.

### 9. Orphaned `patch-package` devDependency

**File:** `package.json`

`patch-package` is listed in `devDependencies` but there is no `patches/` directory and no `postinstall` script wiring it up. Either the patches were never committed or this is a leftover from another project. It should be removed if not in use.

### 10. Unexplained `js-yaml` override

**File:** `package.json`

```json
"overrides": {
    "js-yaml": ">=4.1.1"
}
```

`js-yaml` is not a direct dependency, so this pins a transitive dep — likely in response to a security advisory. It is fine to keep, but a comment explaining the reason would help future contributors understand the intent.

---

## Summary

| # | Issue | Severity | File |
|---|---|---|---|
| 1 | `UIEvent.Layout.Expand` not in `UIEventMap` | Bug | `src/event/ui.ts` |
| 2 | `setTimeout` handles not cleared in `stop()` | Bug | `src/app.ts` |
| 3 | `start()` promise not handled in `bootstrap()` | Bug | `src/main.ts` |
| 4 | Counter state split / unsynchronised | Code quality | `src/counter.ts`, `src/data/data-store.ts`, `src/app.ts` |
| 5 | Inconsistent `AppEvent.UI` vs `UIEvent` access | Code quality | `src/app.ts` |
| 6 | Event handlers lack arrow binding | Code quality | `src/app.ts` |
| 7 | `.js` extension in test import | Consistency | `src/sum.test.ts` |
| 8 | Placeholder title and favicon | Cleanup | `index.html` |
| 9 | Orphaned `patch-package` dependency | Cleanup | `package.json` |
| 10 | Unexplained `js-yaml` override | Cleanup | `package.json` |
