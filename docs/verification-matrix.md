# Current canvas verification

The published entry point is a static design review canvas. Previous live-canvas receipts remain historical evidence, not the current delivery mode.

| Requirement | Verification |
|---|---|
| Full inventory | All 69 canonical documents have static exports and mount on the canvas |
| Comparison | 17 exact pairs; V1 red on left, current on right; two explicit missing counterparts |
| Static artboards | Zero artboard iframes; each screen has inert DOM, no scripts, event attributes or navigation hrefs |
| Clarity | Native text and SVG at 100% and 200%; no bitmap artboards or persistent compositor hint |
| Native-size review | 100% entry zoom and control; static large view retains 390px phone width |
| Mobile | Current screen focus remains readable; full-size viewer scrolls at native dimensions |
| Source fidelity | Export digest covers all source documents, manifest, shared CSS and renderer inputs |
| Design system | Supplied canonical hashes and rendered card font, 24px radius, 16px padding and no border |
| Existing source app | 138 viewport checks and five browser scenarios retained in qa.json |

Current canvas evidence: docs/evidence/static-canvas-qa.json and static-*.png. QA captures are evidence only and are not rendering assets.

Source app routes remain available for development and export generation. The canvas artboards remain static. The explicit Xem prototype action opens the canonical app in one separate viewer. Illustrative fixture data, no production backend or human study claims. Pages publishes codex/uiux-canvas; main merge remains separate.

Optional prototype viewer: keyboard focus, launch, native overview → students → admissions flow, share-hash continuity, close/unmount, mobile 320/360/390px header bounds, direct prototype links and Escape recovery are checked in static-canvas-qa.json. Both overview headers are verified without the removed notification/message shortcut.
