# Minh Hoàng Center · Design Canvas

All 69 original documents are shown as static HTML/SVG on a zoomable comparison canvas: 46 current screens, 19 V1 screens and 4 references. The 17 exact V1/current pairs are adjacent, old on the left with a red outline and current on the right. Two V1 documents without current counterparts are explicitly identified.

Current-screen exports expand to show all content; original V1 compositions retain their dimensions. The 69 canvas artboards contain no prototype iframe or screen interaction. Text and SVG icons render directly in isolated DOM, with inert controls and no scripts or navigation links in each screen. Initial zoom is 100%; the 100% control restores native size. Drag anywhere on a screen to pan; use +/− to zoom, search to locate a pair, and ↗ for a static full-size view. Mobile pair selection focuses one readable screen instead of shrinking both to 41%.

The top-right **Xem prototype** button opens the selected current screen in a separate interactive viewer. A V1 selection uses its current counterpart when available; references or unmatched V1 fall back to the current overview. Native app navigation updates the viewer title and share link (`#prototype=GV01-TongQuan`). Closing the viewer removes its iframe and returns to the static canvas. Top-right notification/message shortcuts have been removed from both overview versions; the existing bottom navigation remains available.

The current screens follow the user-supplied `MinhHoangCenter-DesignSystem.zip`: exact canonical palette/font/component CSS, 24px borderless cards, 16px controls, 28px heroes/sheets, 20px gutters and the floating blue navigation. Original V1 layouts remain visible for comparison. Source hashes and computed-style checks are recorded in `docs/uiux/supplied-design-system.json` and `docs/evidence/static-canvas-qa.json`.

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

`capture` exports inert DOM and scoped CSS from the canonical rendered routes into `assets/static-screens/`, and also saves QA screenshots under `docs/evidence/artboards/`. The canvas renders the DOM exports, never these screenshots. Snapshot freshness is checked against all source documents, shared styles and runtime inputs. `build` prepares the static site in `dist/`; it does not publish. `PLAYWRIGHT_MODULE_PATH` may point to an existing Playwright installation to reuse a bundled browser environment.

## Evidence and limits

- `assets/screens.json`: exact source inventory.
- `docs/ux/`: top tasks, screen inventory, recovery flows and canonical UX structure record.
- `docs/visual-direction.md`: page-role compositions and shared design decisions.
- `docs/uiux/`: Factory routing, retrieval review, v2 decision contract and heuristic direction comparison.
- `docs/evidence/`: route matrix, screenshots and canonical check receipts.
- `scripts/static-canvas-qa.cjs`: exact pairing, 69 inert DOM mounts, zero iframes, native text/SVG scaling, static full-size view, mobile, filters and computed-style checks.
- `docs/verification-matrix.md`: system reality, scope and limitations.

This is a browser prototype with illustrative source data and session drafts. Missing teacher/detail/password targets from the original source get an explicit recovery explanation. There is no production authentication, payment processing, real message delivery or fabricated participant research. Browser checks and decision integrity do not prove human preference, usability outcomes or WCAG conformance.

GitHub Pages can publish the root of the dedicated `codex/uiux-canvas` branch. Returning Pages to the original `main` source is the publication rollback. This keeps main-branch merge separate from the requested demo publication.

