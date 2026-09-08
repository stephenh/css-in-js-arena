# CSS-in-JS Arena

Benchmark harness for **compile-time CSS engines**. Each engine gets its own React Router 8 app under
`apps/`, all rendering the same six-page admin console: identical markup, design and data, verified
pixel-identical before anything is measured.

| Engine | Integration | Version |
| --- | --- | --- |
| [Bamboo CSS](https://bamboocss.com) | `@bamboocss/vite` | 1.55.0 |
| [StyleX](https://stylexjs.com) | `@stylexjs/unplugin` | 0.19.0 |
| [Panda CSS](https://panda-css.com) | `@pandacss/postcss` | 1.12.0 |
| [Truss](https://github.com/homebound-team/truss) | `@homebound/truss/plugin` | 2.29.5 |

Measured 2026-09-08 · Linux, Node 26.8, Vite 8.2.2

| Engine | Shipped bytes | Build & dev | Authoring | Correctness & maintenance | Rows won 🏆 |
| --- | --- | --- | --- | --- | --- |
| Bamboo | 4 / 11 | 1 / 8 | **7** / 9 🏆 | **4** / 4 🏆 | 16 / 32 |
| StyleX | 7 / 11 | 2 / 8 | 2 / 9 | 1 / 4 | 12 / 32 |
| Panda | 1 / 11 | 1 / 8 | 6 / 9 | 1 / 4 | 9 / 32 |
| **Truss** 🏆 | **8** / 11 🏆 | **7** / 8 🏆 | 6 / 9 | 2 / 4 | **23** / 32 🏆 |

Axes are not equally weighted and one is unscored, so the tally is a scanning aid, not the
judgement. **Truss ships the smallest stylesheet and the fastest build, dev start and page render;
Bamboo and StyleX tie it on full first load and Bamboo remains the engine that catches the most
mistakes and prunes the most on delete. Truss's authoring wins are chain syntax and a
one-line-per-style count; its selector, keyframe and theme features are raw CSS in `.css.ts` files,
and a server-rendered app needs a small plugin of its own to link its stylesheet at all.**

---

## Full results

| Axis | Bamboo | StyleX | Panda | Truss 🏆 |
| --- | --- | --- | --- | --- |
| **Shipped bytes** | | | | |
| Full first load | **105,605 B** 🏆 | **106,122 B** 🏆 | 112,835 B | **106,330 B** 🏆 |
| CSS, brotli | 7,357 B | **7,008 B** 🏆 | 9,518 B | **6,946 B** 🏆 (moves up to 30 B build to build: `.css.ts` blocks are unsorted) |
| CSS, gzip | 8,627 B | **8,200 B** 🏆 | 11,489 B | 8,429 B |
| CSS, raw | 43,420 B | **40,430 B** 🏆 | 54,007 B | 44,089 B (per-rule annotation comments ship) |
| CSS rules emitted *(not a quality axis)* | 463 | 467 | 532 | 459 |
| Client JS, brotli | **92,712 B** 🏆 | **93,583 B** 🏆 | 97,778 B | **94,101 B** 🏆 |
| SSR HTML, gzip, mean of 6 | 5,536 B | 5,531 B | 5,539 B | **5,283 B** 🏆 |
| Class attribute bytes, raw | 93,036 B | **70,843 B** 🏆 | 92,738 B | 77,297 B |
| Class attribute bytes, selector-heavy route | 11,728 B | 11,754 B | 11,685 B | **9,423 B** 🏆 |
| Unreachable CSS shipped | **0 B** 🏆 | 344 B | n/a (runtime) | **0 B** 🏆 |
| Orphan file in `include` (50 styles), imported by nothing | +2 B | **+0 B** 🏆 | +13,200 B | **+0 B** 🏆 (no `include`; compiles the bundle graph) |
| Stylesheets emitted | **1** 🏆 | 2 (one unreferenced) | **1** 🏆 | **1** 🏆 (merged by the app's own plugin) |
| **Build & dev** | | | | |
| Production build, cold | 4,519 ms | 6,665 ms | 5,335 ms | **3,021 ms** 🏆 (codegen committed, not run per build) |
| Production build, warm | 4,747 ms | 6,489 ms | 5,272 ms | **3,042 ms** 🏆 |
| Dev server cold start | 4,996 ms | 4,669 ms | 4,634 ms | **2,803 ms** 🏆 |
| Shared edit → server reacts | 43 ms | **6 ms** 🏆 | **5 ms** 🏆 | **7 ms** 🏆 |
| Shared edit → correct paint | 457 ms | 252 ms | 349 ms | **186 ms** 🏆 |
| Component edit → server reacts | 73 ms | **4 ms** 🏆 | 14 ms | **4 ms** 🏆 |
| Component edit → correct paint | 331 ms | 670 ms | 324 ms | **268 ms** 🏆 |
| HMR payload, one shared edit | **342 KB · 9** 🏆 | 392 KB · 11 | 402 KB · 10 | 496 KB · 12 (stylesheet fetched twice) |
| **Authoring** | | | | |
| Total lines written | 3,921 | 4,090 | 3,930 | **2,404** 🏆 (one line per style) |
| Structural & relational selectors | **one rule on the container** 🏆 | class per cell, `last` in JS | **one rule on the container** 🏆 | **one rule on the container** 🏆 (in a `.css.ts`) |
| Next-sibling selector (`+`) | **yes** 🏆 | `~` only, via `when` + a marker | **yes** 🏆 | **yes** 🏆 (in a `.css.ts`) |
| Variant recipes | **`cva`, typed matrix** 🏆 | compose per call site | **`cva`, typed matrix** 🏆 | function over spreads, no matrix |
| Light/dark theming | **2 values per token** 🏆 | 3 values per token | 4 values per token | **2 values per token** 🏆 (custom properties, hand-declared) |
| Dynamic values | inline `style` | **custom property** 🏆 (survives the cascade) | inline `style` | **custom property** 🏆 (survives the cascade) |
| Register an `@property` (not via `globalCss`) | **`global.vars`** 🏆 | **`stylex.types.*`** 🏆 | **`globalVars`** 🏆 | raw block in a `.css.ts` only |
| Animate a registered property | **yes** 🏆 | declaration dropped, no keyframe or rule | **yes** 🏆 | **yes** 🏆 (raw keyframes) |
| Links its stylesheet in a server-rendered app | **`import "virtual:bamboo.css"`** 🏆 | dev needs a shim in `root.tsx` | **plain CSS import** 🏆 | app plugin for dev and prod |
| **Correctness & maintenance** | | | | |
| Mistyped token name | **build fails** 🏆 | TS error, build succeeds | not caught at all | TS error, build succeeds |
| Mistyped property name | **caught** (TS2561) 🏆 | ships `pading-block` | **caught** (TS2561) 🏆 | **caught** (TS2345) 🏆 |
| Delete a page → CSS shrinks | **−22.0%** 🏆 | −8.4% | −13.5% | −10.7% |
| Class names folded to literals | **522 / 522** 🏆 | **453 / 458** 🏆 | 25 / 529 (rest computed in browser, 14.7 KB runtime chunk) | **442 / 442** 🏆 |
| | | | | |
| **Rows won**, of 32 scored 🏆 | **16** | **12** | **9** | **23** |

---

## Where the main table doesn't generalise

One app, one configuration. Three things move the answer: style count, file count, theme count.

### Style volume

The arena is 570 rule blocks. `tools/scale.mjs` generates *N* all-distinct style definitions and
measures the emitted stylesheet.

**Downloaded stylesheet, brotli, relative to Bamboo:**

| Style definitions | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 (as shipped) | ref | −4.7% | +29.4% | −5.8% |
| 50 | ref | +9.8% | +26.0% | −1.2% |
| 200 | ref | +42.1% | +21.0% | +9.1% |
| 800 | ref | **+96.0%** | **+12.3%** | **+23.6%** |

| | Marginal cost per declaration | Gap to Bamboo at n=0 | at n=800 |
| --- | --- | --- | --- |
| Bamboo | 44.0 B raw · 2.0 B brotli | ref | ref |
| Panda | 40.3 B raw · 2.0 B brotli | +10,587 B | −7,013 B |
| StyleX | 65.8 B raw · 5.5 B brotli | −2,990 B | +101,809 B |
| Truss | 68.4 B raw · 2.9 B brotli | +669 B | +117,769 B |

**The baseline ranking does not survive added style volume.** StyleX and Truss both start below
Bamboo and both cross it: StyleX before 50 generated definitions, Truss between 50 and 200. Bamboo and
Panda add 2.0 B brotli per declaration, so Panda's compressed penalty stays close to 2.1 KB even though
its lower raw slope crosses Bamboo by 800 definitions. StyleX is almost pure slope: every rule carries
`:not(#\#)` specificity padding that repeats per declaration and compresses badly. Truss has the
steepest raw slope of all, because it writes a `/* @truss p:… c:… */` annotation above every rule
and, with minification off, ships it; the annotations compress well, so its brotli slope lands
between Bamboo's and StyleX's.

### Dev loop and app size

`tools/dev-scale.mjs` adds *N* generated source files and re-measures. Every module carries identical
declarations, so they fold to the same classes: the first generated module changes Bamboo from
43,420 to 43,604 B and Truss from 44,089 to 44,373 B, then the stylesheets stay flat while only file
count grows.

**Edit → HMR broadcast, ms:**

| Extra source files | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 (as shipped) | 46 | 7 | 6 | 7 |
| 25 | 52 | 7 | 6 | 7 |
| 100 | 47 | 6 | 6 | 7 |
| 400 | 51 | 5 | 4 | 6 |

**There is no per-edit growth with file count.** StyleX, Panda and Truss answer a shared edit in
4–7 ms at every size; Bamboo sits between 46 and 52 ms with no slope either. Whole-inventory work
is not flat:

| | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| Production build, 0 → 400 files | 4,490 → 6,163 ms | 6,211 → 7,561 ms | 5,327 → 5,821 ms | 2,987 → 3,538 ms |
| — per added file | 4.18 ms | 3.38 ms | 1.24 ms | 1.38 ms |
| Dev server cold start, 0 → 400 files | 4,514 → 8,677 ms | 4,360 → 8,168 ms | 4,086 → 6,122 ms | 2,672 → 5,499 ms |
| — per added file | 10.41 ms | 9.52 ms | 5.09 ms | 7.07 ms |

Read the milliseconds, not a percentage: the app is 13 source files, so 400 more is 32× the inventory
and any per-file constant reads as a large percentage off that base. Carried out to 1,600 extra files
(`COUNTS=0,400,800,1600`), the build result is:

| Extra source files | 0 | 400 | 800 | 1,600 | per added file |
| --- | --- | --- | --- | --- | --- |
| Bamboo | 4,333 ms | 5,983 ms | 7,219 ms | 8,986 ms | 2.91 ms |
| StyleX | 6,412 ms | 7,835 ms | 9,225 ms | 11,716 ms | 3.32 ms |
| Panda | 5,350 ms | 5,807 ms | 6,444 ms | 7,699 ms | 1.47 ms |
| Truss | 2,775 ms | 3,724 ms | 4,150 ms | 5,223 ms | 1.53 ms |

**This is where the main table's build rows stop generalising, but only for Bamboo against Panda.**
Truss is fastest at every size and shares the lowest slope with Panda, so its build win survives the
measured range. Panda crosses Bamboo before 400 extra files and closes on Truss without reaching it.
Bamboo stays ahead of StyleX at 1,600 files by 2.7 s and has the lower slope.

Run the same sweep with `ORPHANED=1` and the generated modules remain inside `include` but outside the
bundle graph:

| Orphaned source files | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 | 4,344 ms | 6,225 ms | 5,185 ms | 2,823 ms |
| 400 | 5,089 ms | 6,179 ms | 5,353 ms | 2,811 ms |
| 800 | 5,272 ms | 6,150 ms | 5,903 ms | 2,751 ms |
| 1,600 | 6,315 ms | 6,140 ms | 6,008 ms | 2,918 ms |
| CSS emitted, 0 → 1,600 | +2 B | **+0 B** | +168 B | **+0 B** |

Over the 400→1,600 segment Bamboo adds 1.02 ms per orphaned file, Panda 0.55 ms, Truss 0.09 ms and
StyleX nothing measurable; the Truss and StyleX figures sit inside run-to-run noise, since neither
reads a file the bundle does not reach. Output does not grow per file: StyleX and Truss emit
nothing, Bamboo adds a fixed 2 B once any matching orphan exists, and Panda adds one fixed 168 B
rule set because every generated module contains the same declarations.


### Theming

The arena ships no brand themes. `tools/theming.mjs` injects *N* through each engine's own multi-theme
mechanism (Bamboo `theme.variants`, Panda `themes`, StyleX `createTheme`, Truss a custom-property
block per theme in a `.css.ts`, which is its documented answer since it has no theme API), each
overriding the same 18 colours light and dark.

**Stylesheet the browser downloads, brotli:**

| Brand themes | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 | 7,357 B | 7,008 B | 9,518 B | 6,916 B |
| 2 | 7,357 B | 7,427 B | 9,518 B | 7,253 B |
| 8 | 7,357 B | 8,350 B | 9,518 B | 7,968 B |
| **added per theme** | **0 B** 🏆 | +168 B | **0 B** 🏆 | +132 B |

**Theme payload, fetched only when a theme is selected:**

| Axis | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| Bytes per theme | **1,374 B** 🏆 | n/a (in the stylesheet) | 2,805 B | n/a (in the stylesheet) |
| Themes in the critical path | **none** 🏆 | all of them | **none** 🏆 | all of them |

Two mechanisms, not four. Bamboo and Panda emit each theme as its own artifact loaded on demand, so
first load is flat however many exist. StyleX's `createTheme` and Truss's variable blocks compile into
the linked stylesheet, so every visitor pays for every theme: at eight, StyleX's CSS is **19% larger**
than at zero and Truss's **15%**. Between the lazy two it is the light/dark encoding again, Bamboo
writing `base` and `_osDark` and letting `light-dark()` resolve the rest against Panda's four values,
**2.04× the bytes per theme**. For a site with one fixed brand theme this reverses: a lazy artifact is
a second request for bytes the stylesheet would have carried anyway.

---

## What's measured

### Ground rules

- **One reference app.** `apps/bamboo` is the reference. Every other is diffed against it element for
  element, then pixel for pixel, so all match each other transitively.
- **Shared source is byte-identical.** `data.ts`, `icons.tsx` and `chart-utils.ts` are the same bytes
  in every app.
- **Same baseline reset.** Engines shipping one use theirs. Engines that do not vendor Bamboo's
  `preflight` verbatim, so nobody gets a typography head start.
- **Default configuration only.** Opt-in settings are reported separately, never folded into the main
  table.

### Pages

| Route | What it exercises |
| --- | --- |
| `/` | KPI grid, SVG bar chart + sparklines, activity feed, responsive 2-col dashboard |
| `/projects` | Data table, status badges, progress bars, toolbar, pagination |
| `/settings` | Sticky section nav, 2-col form grid, validation states, toggle switches, radio cards, danger zone, sticky save bar |
| `/pricing` | Featured pricing cards, billing toggle, comparison table, `<details>` FAQ |
| `/docs` | 3-column docs layout, prose typography, code block, callouts, table, TOC |
| `/lab` | Structural + relational selectors, keyframe motion, container queries |

All six are responsive across three breakpoints and support system dark mode plus an explicit toggle.

---

## Reproducing this

Every number comes from one contiguous session on one machine. Harness, parity gate and exact commands
are in **[`RUNNING.md`](./RUNNING.md)**.

---

## FAQ

<details>
<summary><strong>Why is CSS minification disabled?</strong></summary>

`build.cssMinify: false` in all four apps. Vite's default runs Lightning CSS over the stylesheet and
rewrites it, most visibly downlevelling `light-dark()` into a 54-variable polyfill under the
`baseline-widely-available` target. That measures the downleveller, and penalises only engines
emitting modern CSS. Off, every stylesheet here is what its engine wrote.

StyleX still shows Lightning CSS output because `@stylexjs/unplugin` depends on it directly. That is
its product, not the harness. Truss's per-rule `/* @truss … */` annotations ship for the same reason:
they are what the engine writes, and a minifier would be the thing removing them.

</details>

<details>
<summary><strong>What does the Truss app add on top of the engine?</strong></summary>

One Vite plugin, `apps/truss/truss-ssr.ts`. Truss's plugin collects atomic rules while Vite transforms
modules and links the result by rewriting `index.html`, which a React Router app does not have, so
nothing would reference its stylesheet in production and nothing would load its dev runtime. The app
plugin exposes the emitted CSS as `import "virtual:truss.css"` so React Router links it like any other
stylesheet, and in dev `root.tsx` injects Truss's own runtime script the way the StyleX app does. It
also keeps the `.css.ts` selector modules out of Vite's CSS pipeline, where they would otherwise
become an empty per-route stylesheet.

That is why the **Stylesheets emitted** and **Links its stylesheet** cells carry caveats: the single
stylesheet is the app's doing, not the engine's default output. Everything else Truss ships is
measured as it comes.

</details>

<details>
<summary><strong>What does the orphan-file row measure?</strong></summary>

A module matching the engine's `include` glob that nothing imports: the file a deleted feature leaves
behind. `tools/orphan.mjs` writes one carrying 50 style definitions, rebuilds, and diffs the
stylesheet.

Panda extracts from source text, so it ships all 13,200 B whether or not the bundle reaches the file.
StyleX and Truss scope to the bundle graph and emit nothing. Bamboo does not ship the orphaned
definitions, but the matching file changes its stylesheet by a fixed 2 B. The magnitudes are
properties of the fixture; the finding is what remains when the module is unreachable.

</details>

<details>
<summary><strong>Why is the HMR edit four rows instead of one?</strong></summary>

Because one number measured the wrong event. The old probe polled `getComputedStyle` until it
differed from the previous value. `tools/hmr-trace.mjs` shows two faults:

**It fires on a flash.** The first value seen is an inherited fallback, `15px`, and the written value
arrives later by an engine-dependent margin.

**It is not the same event across engines.** An edit produces two signals, the CSS going live and the
JS module re-executing, and the poll catches whichever is first. Which lands last differs by engine
and by edit kind.

Because that head start differs per engine, the flash is not a stable proxy for the ranking. Polling
the first changed value would compare different phases and report a different spread.

Of the four rows only **server reacts** (write to HMR broadcast) is attributable to the engine alone.
Everything later includes Vite's protocol, React Fast Refresh and the socket round trip. **Correct
paint** is end to end.

On this run the shared edit lands JS last for Bamboo, StyleX and Panda and CSS last for Truss, and
the component edit lands CSS last for all four. The flash runs from 0 ms (Panda) to 217 ms (Bamboo)
ahead of the correct paint on the shared edit.

Server-reaction medians of 5, 6 and 7 ms differ by less than their run-to-run scatter (the pooled 28
runs span 3–15 ms), so StyleX, Panda and Truss are scored as a tie on that row; Bamboo's 43 ms is a
different regime, not noise. The server-reaction rows pool 28 runs per engine; the browser-side
phases pool 4 traces of 5 edit pairs, except Truss's shared edit, where one trace produced no
summary and 3 are pooled.

`HMR payload` counts bytes, not milliseconds, and reproduces exactly.

</details>
