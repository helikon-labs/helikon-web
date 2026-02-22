# Code Review: helikon-web v2

This is a review of the v2 template. The foundation is solid — good tooling choices, a clean event system design, and proper HMR setup — but there are a handful of real bugs and consistency issues worth addressing before building on top of this.

---

## Bugs / Correctness Issues

### ~~1. `UIEvent.Layout.Expand` missing from `UIEventMap`~~ ✓ Fixed

`[UIEvent.Layout.Expand]: void` is now present in `UIEventMap` in `src/event/ui.ts`.

### 2. `setTimeout` handles are never cleared in `stop()`

**File:** `src/app.ts:57–64`

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

### ~~3. `app.start()` is not awaited in `bootstrap()`~~ ✓ Fixed

`bootstrap()` in `src/main.ts` now calls `app.start().catch((err) => logger.error('App failed to start:', err))`.

---

## Code Quality / Consistency

### ~~4. Counter state is split between two independent systems~~ ✓ Fixed

`setupCounter()` in `src/counter.ts` now uses the `$counter` atom directly — subscribing to it to update the button text and calling `$counter.set(...)` on click. The two systems are fully synchronised.

### ~~5. Inconsistent event access pattern in the same file~~ ✓ Fixed

`src/app.ts` no longer imports `UIEvent` at all. All event access uses `AppEvent.UI.*` consistently.

### ~~6. Event handler `this` binding is a potential footgun~~ ✓ Fixed

All handlers in `src/app.ts` are now arrow function class properties (`onPing`, `onClose`, `onLayoutChange`), ensuring correct `this` binding and stable reference identity for `mitt`'s `on`/`off`.

### ~~7. `.js` extension in test import is inconsistent~~ ✓ Fixed

`src/sum.test.ts` now imports `from './sum'`, matching the rest of the codebase.

---

## Minor / Cleanup

### 8. Placeholder content in `index.html`

- ~~The page `<title>` is `"Vite + TS"`~~ ✓ Fixed — title is now `"Helikon Home"`.
- The favicon still references `/vite.svg` — the Vite logo placeholder. Should be replaced with the real project favicon.

### ~~9. Orphaned `patch-package` devDependency~~ ✓ Fixed

`patch-package` has been removed from `devDependencies`.

### ~~10. Unexplained `js-yaml` override~~ ✓ Fixed

An `overridesDescription` field was added to `package.json` explaining the reason: `"Overrides the default due to a dependabot security warning."`

---

## Summary

| #   | Issue                                          | Severity     | File                                                     | Status                                    |
| --- | ---------------------------------------------- | ------------ | -------------------------------------------------------- | ----------------------------------------- |
| 1   | `UIEvent.Layout.Expand` not in `UIEventMap`    | Bug          | `src/event/ui.ts`                                        | ✓ Fixed                                   |
| 2   | `setTimeout` handles not cleared in `stop()`   | Bug          | `src/app.ts`                                             | Open                                      |
| 3   | `start()` promise not handled in `bootstrap()` | Bug          | `src/main.ts`                                            | ✓ Fixed                                   |
| 4   | Counter state split / unsynchronised           | Code quality | `src/counter.ts`, `src/data/data-store.ts`, `src/app.ts` | ✓ Fixed                                   |
| 5   | Inconsistent `AppEvent.UI` vs `UIEvent` access | Code quality | `src/app.ts`                                             | ✓ Fixed                                   |
| 6   | Event handlers lack arrow binding              | Code quality | `src/app.ts`                                             | ✓ Fixed                                   |
| 7   | `.js` extension in test import                 | Consistency  | `src/sum.test.ts`                                        | ✓ Fixed                                   |
| 8   | Placeholder title and favicon                  | Cleanup      | `index.html`                                             | Partial (title done, favicon outstanding) |
| 9   | Orphaned `patch-package` dependency            | Cleanup      | `package.json`                                           | ✓ Fixed                                   |
| 10  | Unexplained `js-yaml` override                 | Cleanup      | `package.json`                                           | ✓ Fixed                                   |
