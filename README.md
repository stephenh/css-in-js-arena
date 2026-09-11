# CSS-in-JS Arena

Benchmark harness for **compile-time CSS engines**. Each engine gets its own React Router 8 app under
`apps/`, all rendering the same six-page admin console: identical markup, design and data, verified
pixel-identical before anything is measured.

| Engine | Integration | Version |
| --- | --- | --- |
| [Bamboo CSS](https://bamboocss.com) | `@bamboocss/vite` | 1.55.0 |
| [StyleX](https://stylexjs.com) | `@stylexjs/unplugin` | 0.19.0 |
| [Panda CSS](https://panda-css.com) | `@pandacss/postcss` | 1.12.0 |
| [Truss](https://github.com/homebound-team/truss) | `@homebound/truss/plugin` | 2.29.9 |

Measured 2026-09-11 · Linux, Node 26.8, Vite 8.2.2

| Engine | Shipped bytes | Build & dev | Authoring | Correctness & maintenance | Rows won 🏆 |
| --- | --- | --- | --- | --- | --- |
| Bamboo | 4 / 11 | 2 / 8 | **7** / 9 🏆 | **4** / 4 🏆 | 17 / 32 |
| StyleX | 7 / 11 | 2 / 8 | 2 / 9 | 1 / 4 | 12 / 32 |
| Panda | 1 / 11 | 2 / 8 | 6 / 9 | 1 / 4 | 10 / 32 |
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
| Full first load | **105,605 B** 🏆 | **106,122 B** 🏆 | 112,835 B | **106,319 B** 🏆 |
| CSS, brotli | 7,357 B | **7,008 B** 🏆 | 9,518 B | **6,912 B** 🏆 |
| CSS, gzip | 8,627 B | **8,200 B** 🏆 | 11,489 B | 8,395 B |
| CSS, raw | 43,420 B | **40,430 B** 🏆 | 54,007 B | 44,089 B (per-rule annotation comments ship) |
| CSS rules emitted *(not a quality axis)* | 463 | 467 | 532 | 459 |
| Client JS, brotli | **92,712 B** 🏆 | **93,583 B** 🏆 | 97,778 B | **94,124 B** 🏆 |
| SSR HTML, gzip, mean of 6 | 5,536 B | 5,531 B | 5,539 B | **5,283 B** 🏆 |
| Class attribute bytes, raw | 93,036 B | **70,843 B** 🏆 | 92,738 B | 77,297 B |
| Class attribute bytes, selector-heavy route | 11,728 B | 11,754 B | 11,685 B | **9,423 B** 🏆 |
| Unreachable CSS shipped | **0 B** 🏆 | 344 B | n/a (runtime) | **0 B** 🏆 |
| Orphan file in `include` (50 styles), imported by nothing | +2 B | **+0 B** 🏆 | +13,200 B | **+0 B** 🏆 (no `include`; compiles the bundle graph) |
| Stylesheets emitted | **1** 🏆 | 2 (one unreferenced) | **1** 🏆 | **1** 🏆 (merged by the app's own plugin) |
| **Build & dev** | | | | |
| Production build, cold | 1,661 ms | 2,716 ms | 2,123 ms | **1,123 ms** 🏆 (codegen committed, not run per build) |
| Production build, warm | 1,677 ms | 2,697 ms | 2,123 ms | **1,117 ms** 🏆 |
| Dev server cold start | 1,888 ms | 1,876 ms | 1,756 ms | **1,268 ms** 🏆 |
| Shared edit → server reacts | 15 ms | **2 ms** 🏆 | **2 ms** 🏆 | **3 ms** 🏆 |
| Shared edit → correct paint | 158 ms | 134 ms | 136 ms | **74 ms** 🏆 |
| Component edit → server reacts | 25 ms | **2 ms** 🏆 | 6 ms | **2 ms** 🏆 |
| Component edit → correct paint | **127 ms** 🏆 | 262 ms | **129 ms** 🏆 | **127 ms** 🏆 |
| HMR payload, one shared edit | **342 KB · 9** 🏆 | 356 KB · 10 | 402 KB · 9 | 500 KB · 12 (stylesheet fetched twice) |
| **Authoring** | | | | |
| Total lines written | 3,921 | 4,090 | 3,930 | **2,402** 🏆 (one line per style) |
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
| **Rows won**, of 32 scored 🏆 | **17** | **12** | **10** | **23** |

---

## Where the main table doesn't generalise

One app, one configuration. Three things move the answer: style count, file count, theme count.

### Style volume

The arena is 570 rule blocks. `tools/scale.mjs` generates *N* all-distinct style definitions and
measures the emitted stylesheet.

**Downloaded stylesheet, brotli, relative to Bamboo:**

| Style definitions | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 (as shipped) | ref | −4.7% | +29.4% | −6.0% |
| 50 | ref | +9.8% | +26.0% | −1.0% |
| 200 | ref | +42.1% | +21.0% | +8.8% |
| 800 | ref | **+96.0%** | **+12.3%** | **+23.7%** |

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
| 0 (as shipped) | 16 | 2 | 2 | 2 |
| 25 | 15 | 2 | 2 | 2 |
| 100 | 15 | 2 | 3 | 3 |
| 400 | 17 | 2 | 2 | 3 |

**There is no per-edit growth with file count.** StyleX, Panda and Truss answer a shared edit in
2–3 ms at every size; Bamboo sits at 15–17 ms with no slope either. Whole-inventory work is not
flat:

| | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| Production build, 0 → 400 files | 1,688 → 2,418 ms | 2,929 → 3,444 ms | 2,127 → 2,465 ms | 1,089 → 1,371 ms |
| — per added file | 1.83 ms | 1.29 ms | 0.85 ms | 0.71 ms |
| Dev server cold start, 0 → 400 files | 1,729 → 2,555 ms | 1,692 → 2,531 ms | 1,656 → 2,064 ms | 1,061 → 1,580 ms |
| — per added file | 2.07 ms | 2.10 ms | 1.02 ms | 1.30 ms |

Read the milliseconds, not a percentage: the app is 13 source files, so 400 more is 32× the inventory
and any per-file constant reads as a large percentage off that base. Carried out to 1,600 extra files
(`COUNTS=0,400,800,1600`), the build result is:

| Extra source files | 0 | 400 | 800 | 1,600 | per added file |
| --- | --- | --- | --- | --- | --- |
| Bamboo | 1,635 ms | 2,241 ms | 2,705 ms | 3,702 ms | 1.29 ms |
| StyleX | 2,663 ms | 3,420 ms | 4,054 ms | 5,330 ms | 1.67 ms |
| Panda | 2,150 ms | 2,430 ms | 2,663 ms | 3,161 ms | 0.63 ms |
| Truss | 1,108 ms | 1,396 ms | 1,631 ms | 2,191 ms | 0.68 ms |

**This is where the main table's build rows stop generalising, but only for Bamboo against Panda.**
Truss is fastest at every size and shares the lowest slope with Panda, so its build win survives the
measured range. Panda crosses Bamboo between 400 and 800 extra files and closes on Truss without
reaching it. Bamboo stays ahead of StyleX at 1,600 files by 1.6 s and has the lower slope.

Run the same sweep with `ORPHANED=1` and the generated modules remain inside `include` but outside the
bundle graph:

| Orphaned source files | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 | 1,634 ms | 2,687 ms | 2,101 ms | 1,098 ms |
| 400 | 1,748 ms | 2,668 ms | 2,262 ms | 1,120 ms |
| 800 | 1,863 ms | 2,678 ms | 2,414 ms | 1,096 ms |
| 1,600 | 2,116 ms | 2,663 ms | 2,562 ms | 1,091 ms |
| CSS emitted, 0 → 1,600 | +2 B | **+0 B** | +168 B | **+0 B** |

Over the 400→1,600 segment Bamboo adds 0.31 ms per orphaned file and Panda 0.25 ms; StyleX and
Truss add nothing measurable, since neither reads a file the bundle does not reach. Output does not
grow per file: StyleX and Truss emit nothing, Bamboo adds a fixed 2 B once any matching orphan
exists, and Panda adds one fixed 168 B rule set because every generated module contains the same
declarations.


### Theming

The arena ships no brand themes. `tools/theming.mjs` injects *N* through each engine's own multi-theme
mechanism (Bamboo `theme.variants`, Panda `themes`, StyleX `createTheme`, Truss a custom-property
block per theme in a `.css.ts`, which is its documented answer since it has no theme API), each
overriding the same 18 colours light and dark.

**Stylesheet the browser downloads, brotli:**

| Brand themes | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 | 7,357 B | 7,008 B | 9,518 B | 6,912 B |
| 2 | 7,357 B | 7,427 B | 9,518 B | 7,240 B |
| 8 | 7,357 B | 8,350 B | 9,518 B | 7,961 B |
| **added per theme** | **0 B** 🏆 | +168 B | **0 B** 🏆 | +131 B |

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

On this run the shared edit lands JS last for Bamboo, Panda and Truss and CSS last for StyleX; the
component edit lands CSS last for StyleX, Panda and Truss and JS last for Bamboo. The flash runs
from 0 ms (Panda) to 70 ms (Bamboo) ahead of the correct paint on the shared edit.

Server-reaction medians of 2, 2 and 3 ms differ by less than their run-to-run scatter (the pooled 28
runs span 1–16 ms), so StyleX, Panda and Truss are scored as a tie on that row; Bamboo's 15 ms is a
different regime, not noise. The same holds for the component edit's correct paint, where Bamboo,
Panda and Truss land within 2 ms of each other.

The server-reaction rows pool 28 runs per engine and the browser-side phases pool 4 traces of 5 edit
pairs, except Truss's shared edit. There the trace driver produced no summary in 3 of 4 sweeps and
could not be made to fail on demand, so the row pools 6 traces taken across the session; 3 of them
have no rule-live reading because Truss's dev server never prunes a rule once it has emitted it, and
a font size the session had already seen was live before the edit was written.

`HMR payload` counts bytes, not milliseconds, and reproduces exactly.

</details>
