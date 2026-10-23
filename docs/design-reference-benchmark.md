# Reference transfer, bounded to this app

The baseline is target commit `eeb897bc0b34ff8a819f1dbcbae1d8db5f61a965`. Source and rendered screens supply the actual task vocabulary, fixtures, classroom schedule objects, admissions steps and selection decisions. The original summary used a large decorated greeting card, icon-only inactive tabs, fixed-height screens and several static form controls. No interview or production analytics was supplied.

| Reference | Role | Adopt / adapt | Reject / boundary |
|---|---|---|---|
| Current source and its brand tokens | Education task anatomy | Retain blue, Vietnamese labels, state examples, class-fit comparison and entity metadata | Fixture data is not operational truth; unavailable teacher routes remain unavailable |
| [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Responsive app screens | Real viewport height, scrollable task content and no unintended horizontal overflow at 320px | Canvas is a deliberately two-dimensional workspace; do not shrink all screens into unusable phone UI |
| [WAI validating input](https://www.w3.org/WAI/tutorials/forms/validation/) | Admissions | Errors identify the field, preserve input and allow correction | Client-side checks do not prove backend validity or security |
| [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Live preview and missing-route recovery | Native dialog, named title, focus containment, visible close and Escape | Do not claim full assistive-technology conformance from a browser test |
| Factory structured app-overview retrieval | Page role / visual hierarchy | Current state with next action; compact within a decision; labelled icons | No curated education operations profile or exact reference anatomy. The lexical LMS marketing showcase and teal palette were rejected |

This is a bounded operational-interface study, not a competitor preference study. Production screenshots and real participant preference were not invented. Three distinct proofs are included: workload queue, admissions form and class selection. A second rendered overview direction tests a flat task ledger. Screenshot critique and the canonical integrity receipts are separate from subjective preference and business impact.
