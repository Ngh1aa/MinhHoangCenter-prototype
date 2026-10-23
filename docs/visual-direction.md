# Minh Hoàng: decisions and component contract

Brand facts are limited to the existing source: blue `#253a7e`, Google Sans Flex, Vietnamese copy, education workflows. No external brand guide was supplied. The app is a browser prototype with fixture data. Style words: rõ ràng, điềm tĩnh, chính xác.

The memorable commitment is the education work queue: task count, deadline and next action stay in the same row, with the existing blue as the action and wayfinding color. Large decorative circles are removed. This is a professional hypothesis, not a measured recognition result.

| Role | Entry question | First anchor | Composition | Primary action | Mobile |
|---|---|---|---|---|---|
| Overview | What must I handle first? | Urgent work and daily total | Compact daily summary + priority queue | Open due task | One-column task queue; labels on all five tabs |
| Admissions | What must I enter now? | Student identity and step | Grouped fields with a stable footer | Continue | Real viewport height, scroll fields, keep drafts on Back |
| Select class | Which class fits? | Student need and matching slots | Comparison/select cards + selected summary | Continue to confirmation | Full-width comparison objects, visible mismatch text |
| Canvas | Which screens exist and how do they relate? | Named groups and artboards | Search index + a single spatial plane | Open artboard | Drawer index, drag and reachable zoom controls |

Body 15px/1.5; title 27px/1.25 on overview and 22px/1.25 on task screens; section 18px; UI 13–15px; meta 12–13px. The 10px navigation labels are supplementary to named controls, fit the five destinations and are tested at 320px. App max-width is 520px on direct desktop routes. The prototype viewer uses a 390px phone viewport. These numbers are working design choices, not domain standards.

Gutter 20px, primary group gap 16px, task gaps 10px, task padding 14–15px. Page surface `#f3f5fa`, white objects, border `#dfe4ef`, ink `#171d31`, muted `#626b7d`. Radius 18px on content, 12px on controls, 22px on the daily summary. Color-coded warnings also have text. Inputs own white background, text, border and focus ring together. No new production dependency.

Shared owners: `app/refinement.css` for the existing primitive classes and shared surfaces; `app/interactions.js` for prototype interaction and draft recovery; individual `.dc.html` files keep content, existing DC state and layout. Existing DC event handlers stay authoritative and are not double-toggled by shared delegation. Stale inlined source copies were removed from `proto-shim.js`; browser requests read canonical files.

The alternative is a compact ledger: Segoe UI title 34px/1.2 at weight 400; 8px group gaps; 8px task padding; task rows lead with underlined actions below, and the schedule summary comes later. It prioritizes raw work scanning but pushes the daily context down and has weaker action grouping. The selected direction keeps a denser summary than the baseline while grouping deadlines and actions as complete objects. The comparison changes several axes, so it cannot identify a causal typography or density effect.

The comparison holds fixture identities, counts, task destinations, brand blue and viewport conditions constant. Comprehension questions: can the viewer identify the first due task and its next action; can they find class placement? Distinctiveness question: do task count, deadline and action form an education operations object? Agent screenshot review is heuristic; human preference and business impact remain UNKNOWN.

Visual calibration: KEEP blue actions, five named tabs, class-fit details. REVISE oversized greeting block and fixed artboard heights in live use. REMOVE decorative circles and repeated pill-shaped action buttons. Preserve the v1 visual archive as an explicit separate version.

Media consists of the original illustrative avatars and line icons. No photos or real participants were added. Artboard thumbnails are actual browser captures, not recreated screen mockups. Reference diagrams use contain because they have a different aspect ratio; app screens preserve their full capture ratio.
