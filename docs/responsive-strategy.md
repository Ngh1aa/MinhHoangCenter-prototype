# Static canvas and responsive boundary

The supplied design system declares 390×844px phone viewports. Static current-screen exports expand the content column to show all fields and list items; the minimum phone height remains 844px. Original V1 compositions retain their original dimensions. The source app still adapts to 320px and remains separate from this static review surface.

Canvas: 272px index on desktop, 240px at intermediate widths, drawer below 760px. Seventeen exact pairs place red V1 left and current right. Each screen renders isolated inert HTML/SVG, with no iframe, scripts or screen navigation. The canvas starts at 100%; the native-size control restores integer-aligned 100% rendering. There is no persistent compositor hint on the scaled world.

Pair selection on desktop prioritizes width without shrinking to fit height. Mobile selection focuses the current screen above 80% rather than compressing a pair to 41%; its V1 counterpart stays beside it and is reachable by panning. Static large view keeps native width and scrolls for full content. Reference documents retain native dimensions in large view.

Current verification: all 69 static DOM mounts, exact pairs, no prototype controls, 100%/200% DOM scale, supplied design tokens, pan/search/filter, static large view and mobile. Existing source checks cover 46 current routes at 320, 390 and 768px (138 cases). Screenshots are verification evidence only, not artboard assets. No all-browser, accessibility certification or human-study claim.
