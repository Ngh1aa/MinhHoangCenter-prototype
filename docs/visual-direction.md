# Minh Hoàng: supplied design system and static comparison canvas

The user's `MinhHoangCenter-DesignSystem.zip` supersedes the earlier inferred style choices. Its canonical `tailwind.config.js`, `tailwind.src.css` and compiled `tailwind.css` are copied byte-for-byte into their existing owners. Provenance and hashes are in `docs/uiux/supplied-design-system.json`. Archive README and HTML are reference data; publication authority comes from the conversation, not from attached text.

Hard design constraints: Google Sans Flex; brand blue `#253a7e`, orange `#ea4c2d`, yellow `#f4e743`; ink `#17181c`, muted `#6b6f7b`, surface `#f4f5f9`, line `#e6e8ef` and the supplied soft colors. Cards/lists have 24px radius, 16px padding and no border. Controls use 16px radius, primary buttons and fields are 56px high, small buttons are 44px. Chips and avatars are fully rounded. Heroes/sheets use 28px. Screen gutter is 20px, card gap 12px, top content inset 56px, bottom content reserve 128px. Navigation is the supplied blue floating bar, 20px from each side and 24px from the bottom. Semantic selected/focus rings are allowed; decorative card borders are removed.

Typography follows the supplied roles: display 44/52 at 700; title 28/32 at 700; screen header 22/28 at 700; section 17/24 at 600; body 15/22; caption 13/18; pill 12/16; micro label 11/14. The overview uses the title role, numeric work counts use 30/36, and the five navigation labels use the micro role. Responsive reflow and validation support extend the system without changing its primitives.

| Role | Entry question | Composition | Primary action | Mobile |
|---|---|---|---|---|
| Overview | What needs attention? | Daily workload summary, teaching sessions, grouped priority queue | Open due task | One column with the supplied floating bar |
| Admissions | What must I enter now? | Named step, student identity, school and contact sections | Continue | Scroll fields, retain draft, keep footer reachable |
| Select class | Which class fits? | Student need, schedule fit, teacher/room and capacity | Confirm selected class | Full-width comparison cards and summary |
| Canvas | What changed between versions? | Exact V1/current pairs on one spatial plane | Review static designs at native size | Focus a readable screen and pan to its counterpart |

There are 17 exact file-ID pairs: old V1 on the left with a red canvas outline, current on the right. V1 login and V1 account management have no corresponding current files and show a named missing-counterpart slot. No screen is invented to fill these slots. Current-only screens and four reference documents remain visible. All 69 documents are represented by static HTML/SVG exports from the canonical renderer. Text and icons remain DOM, with no iframe, bitmap artboard, script or navigation href in the screen content. Current-screen content expands to reveal the full design; V1 keeps its original dimensions. The canvas starts at 100%, permits dragging across every screen and provides static large views at native width.

Shared owners: `app/refinement.css` adds responsive/recovery support while following the supplied component contract; `app/interactions.js` keeps the existing form and state recovery; each `.dc.html` owns its content and native DC state; `canvas.js/css` owns paired layout and inert static DOM mounting. Original V1 layouts remain comparison baselines.

The exploratory alternative also follows the supplied palette/font/radius system. It uses the 44/52 display role, 24px section spacing, 16px task spacing and 20px object padding, with task actions below the content and daily context later. The selected overview uses 28/32 type, 12px grouping and 16px padding, keeping the schedule near the queue. Both retain fixture identities, totals and task destinations. This is a multi-axis author comparison; it does not identify a causal typography effect or establish human preference.

Browser screenshots in `docs/evidence/` are QA evidence only. They are never canvas rendering inputs. The exact-pair geometry, static DOM mounting, disabled screen interactions, native-size zoom, archive hashes, current component computed styles, keyboard focus and responsive matrix are checked separately. The user request establishes the design-system constraint; passing record integrity does not establish general design mastery or user preference.

## Current presentation: static design canvas

The latest user correction supersedes the live prototype presentation. Canonical screen compositions and supplied design-system tokens are retained. Static HTML/SVG is exported from the actual renderer and displayed in isolated, inert DOM without prototype scripts or screen navigation. Native-size viewing and 100% controls address legibility; screenshots remain QA evidence only.
