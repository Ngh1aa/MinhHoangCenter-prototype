# Responsive and verification boundary

The supplied design system declares 390×844px mobile screens. The canvas uses a real 390×844 viewport for every app frame so each V1/current pair is comparable; main content scrolls within the frame. Direct routes adapt down to 320px with a 390px maximum. Content begins at 56px, reserves 128px at the bottom and uses the floating navigation 24px above the bottom.

Canvas: persistent 272px index on desktop, 240px at intermediate widths, drawer below 760px. Seventeen exact pairs place red-outline V1 left/current right with the same viewport size. Interaction and pan modes separate iframe input from workspace dragging. Search/version filters move or hide connected frame nodes without detaching their documents. Frames approaching the canvas viewport mount real prototypes; no image fallback is used. Wide reference documents scale their native width into both the canvas and large viewer.

Automated elementary coverage: all 46 current screens at 320, 390 and 768px, 138 route/viewport checks. Additional live-canvas QA mounts all 69 frames, verifies exact pair geometry and computed component tokens, and exercises real input/navigation/state retention. Desktop canvas is 1440×1000; mobile is 390×844. Screenshots are verification evidence only. Reduced motion is supported in CSS.

No claim of exhaustive device coverage, all-browser support, screen-reader certification, field Core Web Vitals or real-user task success is made. v1 is retained as a visual archive and keeps its original fixed composition.
