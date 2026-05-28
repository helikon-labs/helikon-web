# Helikon Web

A high-performance, modular web application template built on SolidJS, Vite, and TypeScript. Designed for desktop-quality UX in the browser.

See [`docs/STACK.md`](docs/STACK.md) for the full dependency reference and architecture guide.  
See [`docs/CSS-GUIDE.md`](docs/CSS-GUIDE.md) for the CSS architecture and lightningcss usage.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start dev server at `localhost:5173`           |
| `npm run build`         | Type-check and build to `dist/`                |
| `npm run preview`       | Serve `dist/` at `localhost:4173`              |
| `npm run test`          | Run tests                                      |
| `npm run test:coverage` | Run tests with coverage report                 |
| `npm run typecheck`     | Type-check without building                    |
| `npm run lint`          | Lint                                           |
| `npm run lint:check`    | Lint, fail on any warning                      |
| `npm run format`        | Format with Prettier                           |
| `npm run format:check`  | Check formatting                               |
| `npm run ci:check`      | Full CI gate: lint, typecheck, coverage, build |
