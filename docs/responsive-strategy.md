# Responsive and verification boundary

The app is a mobile workflow with a comfortable 520px maximum on direct desktop routes. The viewer centers a 390px live frame. The screen uses the current dynamic viewport height, while its main area scrolls and the footer remains reachable. Original long artboard heights are used only for full-screen canvas capture.

Canvas: persistent 272px index on desktop, 240px at intermediate widths, drawer below 760px. Breakpoints respond to index plus canvas width pressure. Screens remain on one spatial plane with drag, wheel/keyboard navigation and explicit zoom controls. Search and version filters reflow that same inventory. The native preview dialog closes back to the same canvas transform.

Automated elementary coverage: all 46 current screens at 320, 390 and 768px, 138 route/viewport checks. Desktop canvas is 1440×1000; representative app compositions are captured at 390×900 and 1280×900. See `docs/evidence/qa.json` and the PNGs. The 69 artboard captures include the 19 legacy and 4 reference documents. Focus and recovery states are exercised in the five scenarios. Reduced motion is supported in CSS.

No claim of exhaustive device coverage, all-browser support, screen-reader certification, field Core Web Vitals or real-user task success is made. v1 is retained as a visual archive and keeps its original fixed composition.
