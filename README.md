# Minh Hoàng Center · Design Canvas

All 69 original documents on a single zoomable canvas: 46 current screens, 19 v1 screens, 4 reference documents. Drag to pan, Ctrl + wheel or the toolbar to zoom, search by Vietnamese title/code, filter versions, select a group or open a live prototype. Each screen can be shared with `#screen=GV01-TongQuan`.

The current app keeps the Minh Hoàng blue identity and Vietnamese workflows. Cards, forms, navigation, responsive viewport behavior, input editing, drafts, validation and selected-class continuity are refined through shared owners. Archived v1 screens keep their original visual language.

## Local development

Node 20 or later is sufficient for the static site:

```sh
npm start
```

Open `http://127.0.0.1:4173`. For browser QA, install development dependencies and Chromium:

```sh
npm install
npx playwright install chromium
npm run check
npm test
npm run capture
npm run build
```

`capture` refreshes the 69 actual browser thumbnails. `build` prepares the static site in `dist/`; it does not publish. `PLAYWRIGHT_MODULE_PATH` may point to an existing Playwright installation to reuse a bundled browser environment.

## Evidence and limits

- `assets/screens.json`: exact source inventory.
- `docs/ux/`: top tasks, screen inventory, recovery flows and canonical UX structure record.
- `docs/visual-direction.md`: page-role compositions and shared design decisions.
- `docs/uiux/`: Factory routing, retrieval review, v2 decision contract and heuristic direction comparison.
- `docs/evidence/`: route matrix, screenshots and canonical check receipts.
- `docs/verification-matrix.md`: system reality, scope and limitations.

This is a browser prototype with illustrative source data and session drafts. Missing teacher/detail/password targets from the original source get an explicit recovery explanation. There is no production authentication, payment processing, real message delivery or fabricated participant research. Browser checks and decision integrity do not prove human preference, usability outcomes or WCAG conformance.

GitHub Pages can publish the root of the dedicated `codex/uiux-canvas` branch. Returning Pages to the original `main` source is the publication rollback. This keeps main-branch merge separate from the requested demo publication.

