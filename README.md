# Minh Hoàng Center · Design Canvas

All 69 original documents run as live prototypes on a single zoomable canvas: 46 current screens, 19 v1 screens, 4 reference documents. The 17 exact V1/current pairs are adjacent, old on the left with a red outline and current on the right. Two V1 documents without current counterparts are explicitly identified. No screenshot tiles or raster fallback are used.

Interact directly inside each screen: type, click controls, navigate and scroll. Choose **Kéo** to pan across prototypes, or **Thao tác** to restore pointer input. Ctrl + wheel and toolbar buttons zoom the canvas. Search, filters and pair selection preserve already-mounted iframe state. Each screen has independent reset and large-preview controls, and can be shared with `#screen=GV01-TongQuan`.

The current screens follow the user-supplied `MinhHoangCenter-DesignSystem.zip`: exact canonical palette/font/component CSS, 24px borderless cards, 16px controls, 28px heroes/sheets, 20px gutters and the floating blue navigation. Original V1 layouts remain visible for comparison. Source hashes and computed-style checks are recorded in `docs/uiux/supplied-design-system.json` and `docs/evidence/live-canvas-qa.json`.

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

`capture` saves browser screenshots under `docs/evidence/artboards/` for QA only. These files are never rendering inputs for the canvas. `build` prepares the static site in `dist/`; it does not publish. `PLAYWRIGHT_MODULE_PATH` may point to an existing Playwright installation to reuse a bundled browser environment.

## Evidence and limits

- `assets/screens.json`: exact source inventory.
- `docs/ux/`: top tasks, screen inventory, recovery flows and canonical UX structure record.
- `docs/visual-direction.md`: page-role compositions and shared design decisions.
- `docs/uiux/`: Factory routing, retrieval review, v2 decision contract and heuristic direction comparison.
- `docs/evidence/`: route matrix, screenshots and canonical check receipts.
- `scripts/live-canvas-qa.cjs`: exact pairing, all 69 real mounts, direct interaction, filter state retention, design-system hashes and computed-style checks.
- `docs/verification-matrix.md`: system reality, scope and limitations.

This is a browser prototype with illustrative source data and session drafts. Missing teacher/detail/password targets from the original source get an explicit recovery explanation. There is no production authentication, payment processing, real message delivery or fabricated participant research. Browser checks and decision integrity do not prove human preference, usability outcomes or WCAG conformance.

GitHub Pages can publish the root of the dedicated `codex/uiux-canvas` branch. Returning Pages to the original `main` source is the publication rollback. This keeps main-branch merge separate from the requested demo publication.

