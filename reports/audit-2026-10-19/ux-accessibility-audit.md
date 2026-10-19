# DIXANI UX and Accessibility Audit — 2026-10-19

## Method and Limits

- **Pages:** all 64 routes were loaded from a local static server in headless Chrome 155.
- **Mobile:** emulated 390 × 844 viewport; desktop checks used 1365 × 900.
- **Interactions:** 68 scripted calculator/tool cases; all executed without harness exceptions.
- **Keyboard:** real `Tab` key events dispatched through Chrome DevTools, not direct `.focus()` calls.
- **Screenshots:** Accuracy Analyzer and CBM mobile tables captured.
- **PDF:** Chrome generated PDF output for Accuracy Analyzer and Reorder Point.
- **Not verified:** physical iOS/Android devices, VoiceOver/TalkBack/NVDA, zoom/reflow at 200–400%, Windows High Contrast, forced colors, print preview pagination, and live production behavior.

The 64-page automated scan found no unnamed visible controls, duplicate IDs, multiple or hidden H1s, or local JavaScript exceptions. That is a good baseline, but it does not replace manual assistive-technology testing.

## Confirmed Positive Findings

| Check | Result |
|---|---|
| Visible controls with no accessible name | 0 |
| Duplicate IDs | 0 pages |
| H1 count | Exactly one per page |
| Hidden H1 | 0 |
| Local JavaScript exceptions on page load | 0 |
| Visible keyboard focus on sampled primary buttons and nav links | Present |
| Checkbox label activation | Wrapped label toggled the checkbox |
| Download artifacts | 30 unique targets; all present and valid |
| PDF generation | Two valid PDFs generated |

Actual Tab navigation reached `#calculateButton` on Reorder Point after 18 focusable elements. The focused button reported an `auto` 1 px outline, and header links also showed visible outlines. The earlier static sample suggesting `outline:none` was a false signal caused by calling `.focus()` without keyboard modality.

## Findings

### UX-01 — CBM mobile page overflows horizontally (High)

**Route:** `/logistics/cbm-calculator/`  
**Evidence:** `evidence/cbm-mobile.png`, `evidence/cbm-table.png`

At a 390 px viewport:

- `document.documentElement.scrollWidth` = 610 px;
- `document.body.scrollWidth` = 610 px;
- table wrapper width = 320 px;
- wrapper scroll width = 538 px;
- computed wrapper `overflow-x` = `visible`.

The mobile stylesheet explicitly sets `.table-wrap{overflow:visible}` at the ≤650 px breakpoint. The table therefore expands the page instead of containing horizontal scrolling. Users can pan the entire page sideways, and the right side of the table is visually cut off.

**Fix:** restore a bounded overflow container at mobile widths, add `min-width:0` to grid/flex ancestors, and provide a card-style or deliberately scrollable table. Verify at 320, 360, 390 and 430 px.

### UX-02 — Accuracy Analyzer document expands on mobile (Medium; device confirmation pending)

**Route:** `/inventory/inventory-accuracy-analyzer/`  
**Evidence:** `evidence/accuracy-mobile.png`, `evidence/accuracy-table.png`

At a 390 px visual viewport, the table wrapper is 328 px wide with a 1,336 px scroll width and `overflow:auto`. The table itself scrolls internally, which is the intended mitigation. However, `document.documentElement.scrollWidth` measured 1,330 px while `body.scrollWidth` measured 390 px. That indicates a document-level horizontal overflow source outside the body’s own box.

**Status:** confirmed in headless Chrome; real-device behavior must be validated before treating it as a production-wide page overflow. The internal table is still very wide and requires substantial horizontal scrolling to reach all columns.

**Fix:** inspect ancestors for intrinsic sizing (`min-width:0`, grid tracks, `width:max-content`) and test on a real mobile viewport. Consider a sticky first column or a row-expansion/edit drawer.

### UX-03 — No skip-to-content link on any page (Medium)

No page contains a skip link. Keyboard and screen-reader users must traverse repeated header navigation on every route.

**Fix:** add a skip link as the first focusable element, target the main content landmark, and keep it visible when focused. Test with Tab and Enter on desktop and mobile.

### UX-04 — Stale results remain after validation failures (High/Medium)

Confirmed on:

- **Working Hours:** valid 08:00–17:00, 60-minute break → 8h 00m and USD 160.00. Change the break to 600 and calculate: the error appears, but both old values remain.
- **Volumetric Weight:** valid shipment → 24.00 kg chargeable. Enter a negative quantity or weight: the error appears, but the prior weight and volume remain.
- **Break-Even:** valid 10,000 / 100 / 60 / 400 → 250 units. Enter a negative fixed cost or price below variable cost: the error appears, but 250 remains visible.

This is a trust and decision-safety problem: a user may copy an old result while looking at an error for new inputs.

**Fix:** clear or explicitly mark result regions stale at the start of every calculate action; only populate them after validation succeeds. Add a visible “not calculated for current inputs” state if preserving old values is desired.

### UX-05 — Error feedback is visible but not fully audited for assistive technology (Medium)

All exercised calculator validation messages were visible on screen. The audit did not verify whether every message is associated with its field through `aria-describedby`, `aria-invalid`, an alert/live region, or a focus move. The HTML contains some validation CSS (`input[aria-invalid=true]`) but that does not prove every error path sets it.

**Recommendation:** standardize error presentation across calculators:

1. Set `aria-invalid="true"` on the failing field.
2. Associate the message with `aria-describedby`.
3. Move focus to the first invalid field or announce the error in a live region.
4. Keep the message until corrected.

### UX-06 — Contrast scan produced hypotheses, not confirmed failures (Medium)

An automated heuristic flagged 181 text nodes across 49 pages. Many are likely decorative, icon-like, or intentionally subdued. Recurring examples:

- “Coming Soon” and related card labels at approximately 2.56:1;
- small optional labels at approximately 2.56:1;
- workflow/card numbers at approximately 1.0–2.0:1;
- some small labels at approximately 4.34–4.37:1.

These are **not classified as WCAG failures** without manual verification of computed background, text role, font size and weight. The coming-soon labels and small helper text should be reviewed first because they convey information.

### UX-07 — Weekday checkbox visual is 18 × 18 px but the label is larger (No confirmed target-size failure)

Cycle Count Planner weekday controls measure 18 × 18 px as inputs. Each is wrapped in a label measuring approximately 67–81 px wide and 44 px high. A programmatic label click toggled the checkbox.

The audit does not classify this as a WCAG 2.5.8 failure because the associated label supplies a larger activation area. A real pointer test at the label center was inconclusive because the element was outside the headless viewport after scrolling; this should be repeated on a physical device.

### UX-08 — Mobile tables need better affordances (Medium)

Accuracy Analyzer tables are horizontally scrollable but wide; the visible scrollbar appears only at the bottom. Users may not discover additional columns. The CBM table is not contained at all.

**Recommendations:** add a visible “Scroll for more columns” hint, sticky column headers, and a frozen SKU column. For editing on mobile, consider a card/row editor instead of a 1,330 px table.

### UX-09 — Search and navigation are structurally functional (Pass)

Existing tests confirm the search index covers every page, known tool queries resolve to the correct target first, empty queries return no results, and the search UI is wired with accessible attributes. Static link checks found no broken or orphan routes.

This audit did not repeat an open-ended usability study of search relevance or mobile menu behavior.

## Usability Strengths

- Pallet and container pages state their planning limitations clearly and do not overclaim optimization.
- Accuracy Analyzer uses explicit “Exact-match accuracy” language rather than conflating record and value accuracy.
- Cycle Count Planner uses local save/restore and explicit completion history, with CSV formula-injection protection on export.
- All download links resolve to real files.
- Calculator errors are visually distinct from success messages.
- Keyboard focus is visible on the sampled controls.

## Priority Recommendation

1. Fix CBM mobile overflow and confirm Accuracy Analyzer overflow on a real device.
2. Add a skip link and standardized validation/result-clearing behavior.
3. Manually test contrast on coming-soon and helper text.
4. Add mobile table affordances and keyboard/assistive-technology testing.
5. Review print preview pagination and table clipping on the exported PDFs.

## Evidence

- `evidence/dixani-page-audit.json`
- `evidence/browser-interaction-results.json`
- `evidence/remaining-checks-results.json`
- `evidence/cbm-mobile.png`
- `evidence/cbm-table.png`
- `evidence/accuracy-mobile.png`
- `evidence/accuracy-table.png`
- `evidence/accuracy-analyzer-print.pdf`
- `evidence/reorder-point-print.pdf`
