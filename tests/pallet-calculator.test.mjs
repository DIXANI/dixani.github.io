// Regression tests for the DIXANI Pallet Calculator CBM output.
//
// Run:  node --test tests/
//
// WHY THESE TESTS EXIST
// ---------------------
// An audit flagged the pallet calculator's "CBM" output as a possible bug
// because it includes the empty pallet height. Investigation of the tool's
// own UI, labels and documentation showed the output is INTENTIONALLY the
// loaded-pallet ENVELOPE volume (pallet + cartons + air gaps), i.e. the
// shipping space the whole loaded unit occupies. Cargo-only volume is
// provided by the separate CBM Calculator (/logistics/cbm-calculator/).
//
// These tests lock in that intended behaviour so nobody "fixes" the
// formula into cargo volume (or breaks it) by accident.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const palletJs = readFileSync(join(repoRoot, "assets/js/pallet-calculator.js"), "utf8");
const cbmJs = readFileSync(join(repoRoot, "assets/js/cbm-calculator.js"), "utf8");

// --- Unit factors, copied from pallet-calculator.js (factor map) ---
const factor = { cm: 0.01, mm: 0.001, m: 1, in: 0.0254, ft: 0.3048 };

/**
 * Faithful re-implementation of the production pallet maths.
 * Mirrors assets/js/pallet-calculator.js `calc()` exactly.
 */
function palletCalc({ total, cl, cw, ch, pl, pw, mh, ph = 0, unit = "cm", rotate = true }) {
  const f = factor[unit];
  // Orientation selection: simple grid, normal vs 90 deg rotated.
  const nc = Math.floor(pl / cl), nr = Math.floor(pw / cw);
  const normal = nc * nr;
  const rc = Math.floor(pl / cw), rr = Math.floor(pw / cl);
  const rot = rc * rr;
  let per = normal, L = cl, W = cw;
  if (rotate && rot > normal) { per = rot; L = cw; W = cl; }
  const layers = Math.floor((mh - ph) / ch);
  const cap = per * layers;
  const loaded = ph + layers * ch;                 // pallet + stack (envelope height)
  const util = (per * L * W) / (pl * pw) * 100;
  const cbm = pl * f * pw * f * loaded * f;         // ENVELOPE volume (includes pallet)
  const cargoCbm = cap * (cl * f) * (cw * f) * (ch * f); // cargo-only volume (for reference)
  return { per, layers, cap, loaded, util, cbm, cargoCbm };
}

// ---------------------------------------------------------------------------
// 1. Source-integrity guard: the production formula must stay the envelope.
// ---------------------------------------------------------------------------
test("pallet-calculator.js keeps the envelope CBM formula (incl. pallet height)", () => {
  assert.match(
    palletJs,
    /cbm\s*=\s*a\.pl\s*\*\s*f\s*\*\s*a\.pw\s*\*\s*f\s*\*\s*loaded\s*\*\s*f/,
    "Expected cbm = pl * f * pw * f * loaded * f (bounding-box / envelope volume)."
  );
  assert.match(
    palletJs,
    /loaded\s*=\s*a\.ph\s*\+\s*layers\s*\*\s*a\.ch/,
    "Expected loaded height to include the empty pallet height (a.ph)."
  );
});

test("pallet calculator UI label states the CBM includes the pallet", () => {
  const html = readFileSync(
    join(repoRoot, "logistics/pallet-calculator/index.html"),
    "utf8"
  );
  assert.match(
    html,
    /Loaded Pallet CBM \(incl\. pallet\)/,
    "Result label must make clear the CBM includes the pallet."
  );
  assert.match(
    html,
    /includes the empty pallet height/,
    "Explanatory copy must state the pallet height is included."
  );
});

// ---------------------------------------------------------------------------
// 2. Documented worked example (DIXANI's own sample inputs).
//    Carton 40 x 30 x 25 cm, pallet 120 x 100 cm, max height 150 cm,
//    empty pallet height 15 cm, rotation allowed, 200 cartons.
// ---------------------------------------------------------------------------
const SAMPLE = { total: 200, cl: 40, cw: 30, ch: 25, pl: 120, pw: 100, mh: 150, ph: 15, unit: "cm", rotate: true };

test("sample: layout metrics match the published example (9 per layer x 5 layers = 45/pallet)", () => {
  const r = palletCalc(SAMPLE);
  assert.equal(r.per, 9, "cartons per layer");
  assert.equal(r.layers, 5, "layers per pallet");
  assert.equal(r.cap, 45, "cartons per pallet");
  assert.equal(r.loaded, 140, "loaded height (15 pallet + 5x25 cartons) in cm");
});

test("sample: loaded pallet envelope CBM is 1.68 m3 (INCLUDES pallet height)", () => {
  const r = palletCalc(SAMPLE);
  // 1.20 m * 1.00 m * 1.40 m = 1.68 m3
  assert.equal(Number(r.cbm.toFixed(4)), 1.68);
});

test("sample: carton-only cargo CBM is 1.35 m3 (EXCLUDES pallet height and gaps)", () => {
  const r = palletCalc(SAMPLE);
  // 45 cartons * (0.40 * 0.30 * 0.25) = 45 * 0.03 = 1.35 m3
  assert.equal(Number(r.cargoCbm.toFixed(4)), 1.35);
});

test("sample: envelope volume exceeds cargo volume only by the pallet + air gaps", () => {
  const r = palletCalc(SAMPLE);
  assert.ok(r.cbm > r.cargoCbm, "envelope must be larger than cargo-only volume");
  // Difference is the pallet slab + inter-carton air, ~0.33 m3 here.
  assert.equal(Number((r.cbm - r.cargoCbm).toFixed(4)), 0.33);
});

// ---------------------------------------------------------------------------
// 3. Unit conversion: the same physical load must yield the same CBM in any unit.
// ---------------------------------------------------------------------------
test("unit handling: identical physical load in cm, mm, m, in and ft gives the same CBM", () => {
  const per = { cm: 1, mm: 10, m: 0.01, in: 1 / 2.54, ft: 1 / 30.48 };
  const base = palletCalc(SAMPLE).cbm;
  for (const [unit, k] of Object.entries(per)) {
    const r = palletCalc({ ...SAMPLE, unit, cl: 40 * k, cw: 30 * k, ch: 25 * k, pl: 120 * k, pw: 100 * k, mh: 150 * k, ph: 15 * k });
    assert.equal(Number(r.cbm.toFixed(3)), Number(base.toFixed(3)), `CBM mismatch for unit ${unit}`);
  }
});

// ---------------------------------------------------------------------------
// 4. Edge cases.
// ---------------------------------------------------------------------------
test("edge: removing the pallet height frees one extra layer (6 x 25 cm = 150 cm)", () => {
  const r = palletCalc({ ...SAMPLE, ph: 0 });
  // With ph=0 the usable height is the full 150 cm -> floor(150/25) = 6 layers,
  // so the envelope grows to 1.20 * 1.00 * 1.50 = 1.80 m3.
  assert.equal(r.layers, 6);
  assert.equal(r.loaded, 150);
  assert.equal(Number(r.cbm.toFixed(4)), 1.8);
});

test("edge: removing the pallet height still fits the sample stack box", () => {
  const r = palletCalc({ ...SAMPLE, ph: 0 });
  // Sanity: pallet-height removal never lowers the achievable envelope volume.
  assert.ok(r.cbm >= palletCalc(SAMPLE).cbm);
});

test("edge: a carton too tall for the available height yields zero layers", () => {
  const r = palletCalc({ ...SAMPLE, ch: 200 });
  assert.equal(r.layers, 0);
  assert.equal(r.cap, 0);
});

test("edge: a carton footprint larger than the pallet yields zero cartons per layer", () => {
  const r = palletCalc({ ...SAMPLE, cl: 500, cw: 500 });
  assert.equal(r.per, 0);
});

test("edge: utilisation never exceeds the pallet footprint (no >100% artefact)", () => {
  const r = palletCalc(SAMPLE);
  // per=9 cartons of 40x30 over 120x100 = 9*1200 / 12000 = 90%
  assert.equal(Number(r.util.toFixed(2)), 90);
});

// ---------------------------------------------------------------------------
// 5. Cross-tool consistency (read-only): CBM Calculator is cargo-only.
//    We assert its formula shape but DO NOT modify it.
// ---------------------------------------------------------------------------
test("cbm-calculator.js computes cargo-only volume (l*w*h per carton), unlike the pallet envelope", () => {
  assert.match(
    cbmJs,
    /const\s+cbm\s*=\s*\(l\*factor\)\*\(w\*factor\)\*\(h\*factor\)/,
    "CBM Calculator must remain carton-volume based (cargo only)."
  );
  // Explicit documentation of the intentional divergence:
  //   Pallet calculator  -> envelope volume (pallet + cartons + gaps) = 1.68 m3
  //   CBM calculator     -> cargo volume (cartons only)               = 1.35 m3
  const env = palletCalc(SAMPLE).cbm;
  const cargo = palletCalc(SAMPLE).cargoCbm;
  assert.notEqual(Number(env.toFixed(4)), Number(cargo.toFixed(4)));
});
