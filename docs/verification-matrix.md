# Verification and system reality

Mode: browser prototype, static fixture data, local session drafts. No server login, payment processing, SMS, message delivery or school policy integration is implemented by this visual work.

| Change | Verification | Scope |
|---|---|---|
| Complete canvas | Exact equality between app HTML inventory, manifest and 69 artboard previews | All existing files |
| Shared visual owner | Render, overflow, image and runtime checks at 320/390/768px | All 46 current screens, 138 cases |
| Preview experience | Search, empty recovery, version filters, pan/zoom, open/close dialog and deep-link metadata | Desktop and mobile |
| Form recovery | Clear required name → inline error and focus → correct it → next → Back retains it | Admissions representative |
| Class continuity | Choose second teacher → confirmation displays selected teacher and room → toggle notifications once | Xếp lớp representative |
| Missing source | Named explanation and close; source absence does not become a fabricated completed screen | Static and dynamic destination checks |
| Design reasoning | UX structure and visual v2 design/render integrity receipts with screenshot hashes | Three compositions; one direction comparison |

The five scenarios are agent browser walkthroughs, not sessions with five people. Integrity PASS verifies complete and consistent decision/evidence records. The author comparison is HEURISTIC_ONLY. Human preference, usability outcomes and business impact remain UNKNOWN.

Known source limitations: the repo contains mainly Giáo vụ screens. Several teacher, password and notification detail targets appear only as links in the original diagram. The prototype explains their absence; it does not invent their business rules. Some less central controls show an explicit prototype limitation because their original data/action is absent. All current screens receive shared responsive and style refinement, but this is not a new backend or a formal accessibility audit.

Performance decisions: the canvas loads actual captured images lazily and mounts only one live iframe when requested. Removing the original 836KB inlined HTML cache avoids stale duplicate ownership. No frontend production framework or library was added; Playwright is development-only QA.

Release rollback: GitHub Pages can be restored to the previous `main` source. The source change is isolated on `codex/uiux-canvas` and reviewed through a pull request; publication and main-branch merge are separate states.
