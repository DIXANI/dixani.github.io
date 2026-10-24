# DIXANI — GSC Read, 2026-10-24 (first post-Tier-1 data)

**Source:** `dixani.com-Performance-on-Search-2026-10-24.zip` (user download, 2026-10-24 16:42)
**Filters in export:** Search type = Web (text-based); Date = **Last 3 months**
**Data range:** 2026-09-03 → **2026-10-22** (GSC's usual ~2-day lag; 50 days)
**Totals in window:** 36 clicks, 5,694 impressions, 0.63% CTR

---

## 0. Headline

**Tier 1 looks positive on every available metric — but the window is too short to
call it, and the export is not the window we asked for.**

| Metric | PRE Tier 1 (Sep 5 – Oct 15, 41 d) | POST Tier 1 (Oct 16 – 22, 7 d) | Change |
|---|---|---|---|
| Clicks/day | 0.54 | **2.00** | **+270%** |
| Impressions/day | 117.8 | **275.6** | **+134%** |
| Position | ~35 (varies) | ~47 | **worse** |

**But** POST is only **7 days**. Do not treat this as proof. Treat it as *"no red flags,
keep watching"* — and note that the impression ramp **started before Tier 1 deployed**
(see §1).

⚠️ **This is NOT the 28-day Tier 1 window.** The user needs: Filters → Date → **Custom**
→ 2026-10-16 to 2026-11-13, exported on/after **2026-11-16**. This export is a
Last-3-months view that happens to include 7 post-deploy days.

---

## 1. The traffic is climbing — and mostly NOT because of Tier 1

Weekly impressions/day (week begins Monday):

| Week of | imps/day | clicks | Note |
|---|---|---|---|
| 2026-08-31 | 18.5 | 1 | first few days |
| 2026-09-07 | 98.6 | 0 | indexing began |
| 2026-09-14 | 97.1 | 1 | flat |
| 2026-09-21 | 163.1 | 4 | step up |
| 2026-09-28 | 138.7 | 8 | |
| 2026-10-05 | 111.9 | 5 | dip |
| 2026-10-12 | 157.6 | 6 | |
| 2026-10-19 | **337.8** | 11 | 4 days only (10-19→10-22) |

The trend was already rising from 09-21 onward. Two obvious confounds for the
Oct 19+ jump:

1. **Four new guides went live 2026-10-20** (`ac78bb7`, `9e1288d`) — new URLs
   immediately start collecting impressions at poor positions.
2. **Normal new-site ramp** — a site this young climbs as Google indexes more pages.

**Conclusion: the Oct 19+ impression spike is largely new-URL discovery, not Tier 1
metadata improvements.** Do not credit Tier 1 for it.

---

## 2. Position got WORSE post-deploy (expected, not alarming)

Position went from ~35 to ~47. This is **exactly what adding new URLs does**: fresh
pages land at positions 50-70 and drag the *site-wide average* down, even if every
individual page improved. Site-average position is a near-useless metric once you're
adding pages. Judge on **per-query** and **per-page** movement instead — which needs
the custom 28-day comparison, not this export.

---

## 3. What the impressions actually are (the real problem)

Top queries by impressions — **48 of the top 50 have ZERO clicks**:

| Impressions | Clicks | Query |
|---|---|---|
| 157 | 0 | warehouse space utilization |
| 136 | 0 | how to calculate warehouse space |
| 132 | 0 | warehouse space calculation |
| 103 | 0 | warehouse utilization formula |
| 102 | 0 | space utilization formula |
| 102 | 0 | warehouse space utilization analysis |
| 77 | 0 | container loading |
| 70 | 0 | safety stock calculator |
| 69 | 0 | warehouse space utilization formula |
| 64 | 0 | container loading calculator |

Only **6 queries out of 703** earned a single click.

**Interpretation:** the site is being *shown* for real demand (good — topical
relevance is recognised) but ranks far too low to be clicked. The problem is
**position, not targeting.** Tier 1's descriptions cannot fix position; that needs
content depth + links + time.

**Notable:** the `warehouse space utilization` cluster (~700 impressions across 8
variants, all position >30, zero clicks) is the single biggest demand pocket on the
site, and `guides/warehouse-space-utilization` is the page targeting it (928 imps,
0 clicks, pos 32.0). That page is the highest-leverage asset on the site.

---

## 4. Pages with actual clicks

| Clicks | Impressions | CTR | Position | Page |
|---|---|---|---|---|
| 6 | 699 | 0.86% | 48.3 | `/logistics/pallet-calculator/` |
| 5 | 102 | 4.90% | 22.5 | `/templates/warehouse/picking-list/` |
| 5 | 42 | 11.9% | 3.8 | `/` (homepage) |
| 4 | 241 | 1.66% | 11.7 | `/templates/inventory/stock-count-sheet/` |
| 2 | 352 | 0.57% | 21.7 | `/guides/abc-inventory-analysis/` |
| 2 | 71 | 2.82% | 12.7 | `/templates/warehouse/goods-issue-note/` |
| 2 | 25 | 8.00% | 9.3 | `/templates/inventory/stock-variance-report/` |
| 2 | 8 | 25.0% | 12.8 | `/simulators/warehouse-shift-challenge/` |

**Pattern: templates convert far better than calculators.** `picking-list` (4.9% CTR)
and `stock-variance-report` (8.0%) beat `pallet-calculator` (0.86%) by ~6-9x. Templates
at position 9-13 get clicked; calculators at position 48 do not. **This confirms the
templates are the site's strongest asset class.**

---

## 5. The four new guides — early signal

All four are indexed and already collecting impressions at poor positions:

| Page | Impressions | Clicks | Position |
|---|---|---|---|
| `guides/warehouse-space-utilization` | 928 | 0 | 32.0 |
| `guides/warehouse-cycle-count-checklist` | 124 | 0 | 36.6 |
| `guides/container-stuffing-load-planning` | 19 | 1 | 52.7 |
| `guides/warehouse-capacity-storage-cost` | 15 | 0 | 71.6 |
| `guides/cycle-count-scheduling` | 6 | 0 | 47.2 |

`warehouse-space-utilization` earning 928 impressions within days of launch confirms
the topic is right. It just needs to rank. **This is the strongest evidence yet that
the warehouse/space topic cluster deserves the next content investment.**

---

## 6. Device split — a real finding

| Device | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| Desktop | 32 | 5,618 | 0.57% | 43.9 |
| Mobile | 4 | 1,120 | 0.36% | **19.0** |
| Tablet | 0 | 19 | 0% | 22.3 |

**Mobile ranks dramatically better (19.0 vs 43.9) but converts worse (0.36% vs 0.57%).**
Worth a focused look at mobile rendering/title truncation on the mobile-strong pages.
Low priority, but it is a genuine, unexplained gap.

---

## 7. Recommended actions

**Do now (zero risk, no attribution damage):**
1. **Nothing SERP-visible.** The Tier 1 window is still open. Resist the urge to
   "fix" the position numbers this week — it will destroy the measurement.

**Do at ~2026-11-13-16:**
2. **Re-export with a custom date range** (2026-10-16 to 2026-11-13) and compare
   *per-page* and *per-query* against the Sep 18 - Oct 15 period. Site averages will
   mislead; use page-level diffs.
3. **Prioritise the warehouse/space cluster for Tier 2.** ~700 impressions, zero
   clicks, one page carrying 928 of them. Deepening
   `guides/warehouse-space-utilization` is the highest-leverage content move available.
4. **Consider more templates.** Templates show 5-9x the CTR of calculators at
   comparable positions. Clearest conversion signal in the data.

**Investigate (cheap, non-SERP):**
5. Mobile CTR vs desktop gap (section 6).

