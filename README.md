# CSS-in-JS Arena

Benchmark harness for **compile-time CSS engines**. Each engine gets its own React Router 8 app under
`apps/`, all rendering the same six-page admin console: identical markup, design and data, verified
pixel-identical before anything is measured.

| Engine | Integration | Version |
| --- | --- | --- |
| [Bamboo CSS](https://bamboocss.com) | `@bamboocss/vite` | 1.55.0 |
| [StyleX](https://stylexjs.com) | `@stylexjs/unplugin` | 0.19.0 |
| [Panda CSS](https://panda-css.com) | `@pandacss/postcss` | 1.12.0 |
| [Truss](https://github.com/homebound-team/truss) | `@homebound/truss/plugin` | 2.33.1 |

Measured 2026-09-13 · Linux, Node 26.8, Vite 8.2.2

| Engine | Shipped bytes | Build & dev | Authoring | Correctness & maintenance | Rows won 🏆 |
| --- | --- | --- | --- | --- | --- |
| Bamboo | 3 / 11 | 0 / 7 | 7 / 9 | **4** / 4 🏆 | 14 / 31 |
| StyleX | 2 / 11 | 0 / 7 | 2 / 9 | 1 / 4 | 5 / 31 |
| Panda | 1 / 11 | 1 / 7 | 6 / 9 | 1 / 4 | 9 / 31 |
| **Truss** 🏆 | **11** / 11 🏆 | **6** / 7 🏆 | **9** / 9 🏆 | 3 / 4 | **29** / 31 🏆 |

Axes are not equally weighted and two are unscored, so the tally is a scanning aid, not the
judgement. **Truss wins every shipped-bytes and authoring row.** Its stylesheet is a third smaller
than Bamboo's, and it has the lowest marginal cost per declaration and the lowest per-file build
slope, so neither lead depends on this app's size. It also builds and starts fastest and refetches
the least on an edit.

Truss loses two rows. **Bamboo prunes the most CSS when a page is deleted** — though that row
rewards having had more to delete, and Truss still ships less CSS after the deletion than Bamboo
does before it. **Panda answers a component edit fastest**, because its Vite-side JavaScript
transform is a no-op; the engines that compile the edited module all pay for it. On the two rows
that are actually about catching a mistake, Bamboo and Truss tie: both fail the build on a mistyped
token and flag a mistyped property, where StyleX ships `pading-block` and Panda does not catch the
token at all.

---

## Full results

| Axis | Bamboo | StyleX | Panda | Truss 🏆 |
| --- | --- | --- | --- | --- |
| **Shipped bytes** | | | | |
| Full first load | 105,605 B | 106,122 B | 112,835 B | **104,783 B** 🏆 |
| CSS, brotli | 7,357 B | 7,008 B | 9,518 B | **5,612 B** 🏆 |
| CSS, gzip | 8,627 B | 8,200 B | 11,489 B | **6,657 B** 🏆 |
| CSS, raw | 43,420 B | 40,430 B | 54,007 B | **28,432 B** 🏆 |
| CSS rules emitted *(not a quality axis)* | 463 | 467 | 532 | 450 |
| Client JS, brotli | **92,712 B** 🏆 | **93,583 B** 🏆 | 97,778 B | **94,053 B** 🏆 |
| SSR HTML, gzip, mean of 6 | 5,536 B | 5,531 B | 5,539 B | **5,118 B** 🏆 |
| Class attribute bytes, raw | 93,036 B | 70,843 B | 92,738 B | **62,375 B** 🏆 |
| Class attribute bytes, selector-heavy route | 11,728 B | 11,754 B | 11,685 B | **7,702 B** 🏆 |
| Unreachable CSS shipped | **0 B** 🏆 | 344 B | n/a (runtime) | **0 B** 🏆 |
| Orphan file in `include` (50 styles), imported by nothing | +2 B | **+0 B** 🏆 | +13,200 B | **+0 B** 🏆 (no `include`; compiles the bundle graph) |
| Stylesheets emitted | **1** 🏆 | 2 (one unreferenced) | **1** 🏆 | **1** 🏆 |
| **Build & dev** | | | | |
| Production build, cold | 1,520 ms | 2,525 ms | 1,970 ms | **1,040 ms** 🏆 (codegen committed, not run per build) |
| Production build, warm | 1,542 ms | 2,517 ms | 1,976 ms | **1,054 ms** 🏆 |
| Dev server cold start | 1,761 ms | 1,672 ms | 1,628 ms | **1,017 ms** 🏆 |
| Shared edit → server reacts *(not measurable: no update payload reaches a browserless client)* | — | — | — | — |
| Shared edit → correct paint | 166 ms | 130 ms | 127 ms | **71 ms** 🏆 |
| Component edit → server reacts | 23 ms | 74 ms | **5 ms** 🏆 | 20 ms |
| Component edit → correct paint | 128 ms | 225 ms | 109 ms | **105 ms** 🏆 |
| HMR payload, one shared edit | 342 KB · 9 | 392 KB · 11 | 402 KB · 9 | **331 KB · 8** 🏆 |
| **Authoring** | | | | |
| Total lines written | 3,921 | 4,090 | 3,930 | **2,331** 🏆 (one line per style) |
| Structural & relational selectors | **one rule on the container** 🏆 | class per cell, `last` in JS | **one rule on the container** 🏆 | **one rule on the container** 🏆 (in a `.css.ts`) |
| Next-sibling selector (`+`) | **yes** 🏆 | `~` only, via `when` + a marker | **yes** 🏆 | **yes** 🏆 (in a `.css.ts`) |
| Component variants, typed and exhaustive | **`cva`, inferred props** 🏆 | compose per call site | **`cva`, inferred props** 🏆 | **`Record<Union, Properties>`, declared props** 🏆 |
| Light/dark theming | **2 values per token** 🏆 | 3 values per token | 4 values per token | **2 values per token** 🏆 (custom properties, hand-declared) |
| Dynamic values | inline `style` | **custom property** 🏆 (survives the cascade) | inline `style` | **custom property** 🏆 (survives the cascade) |
| Register an `@property` (not via `globalCss`) | **`global.vars`** 🏆 | **`stylex.types.*`** 🏆 | **`globalVars`** 🏆 | **`tokens` object form** 🏆 |
| Animate a registered property | **yes** 🏆 | declaration dropped, no keyframe or rule | **yes** 🏆 | **yes** 🏆 (`keyframes` config) |
| Links its stylesheet in a server-rendered app | **`import "virtual:bamboo.css"`** 🏆 | dev needs a shim in `root.tsx` | **plain CSS import** 🏆 | **`import "virtual:truss.css"`** 🏆 |
| **Correctness & maintenance** | | | | |
| Mistyped token name | **build fails** 🏆 | TS error, build succeeds | not caught at all | **build fails** 🏆 (with a did-you-mean) |
| Mistyped property name | **caught** (TS2561) 🏆 | ships `pading-block` | **caught** (TS2561) 🏆 | **caught** (TS2345) 🏆 |
| Delete a page → CSS shrinks | **−22.0%** 🏆 | −8.4% | −13.5% | −12.6% |
| Class names folded to literals | **507 / 507** 🏆 | **451 / 454** 🏆 | 2 / 503 (rest computed in browser, 14.7 KB runtime chunk) | **418 / 418** 🏆 |
| | | | | |
| **Rows won**, of 31 scored 🏆 | **14** | **5** | **9** | **29** |

---

## Where the main table doesn't generalise

One app, one configuration. Three things move the answer: style count, file count, theme count.

### Style volume

The arena is 662 rule blocks. `tools/scale.mjs` generates *N* all-distinct style definitions and
measures the emitted stylesheet.

**Downloaded stylesheet, brotli, relative to Bamboo:**

| Style definitions | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 (as shipped) | ref | −4.7% | +29.4% | −23.7% |
| 50 | ref | +9.8% | +26.0% | −22.4% |
| 200 | ref | +42.1% | +21.0% | −20.0% |
| 800 | ref | **+96.0%** | **+12.3%** | **−16.4%** |

| | Marginal cost per declaration | Gap to Bamboo at n=0 | at n=800 |
| --- | --- | --- | --- |
| Bamboo | 44.0 B raw · 2.0 B brotli | ref | ref |
| Panda | 40.3 B raw · 2.0 B brotli | +10,587 B | −7,013 B |
| StyleX | 65.8 B raw · 5.5 B brotli | −2,990 B | +101,809 B |
| Truss | 33.4 B raw · 1.8 B brotli | −14,988 B | −65,788 B |

**The baseline ranking does not fully survive added style volume.** StyleX starts below Bamboo and
crosses it before 50 generated definitions: it is almost pure slope, since every rule carries
`:not(#\#)` specificity padding that repeats per declaration and compresses badly. Bamboo and Panda
add 2.0 B brotli per declaration, so Panda's compressed penalty stays close to 2.1 KB even though its
lower raw slope crosses Bamboo by 800 definitions. Truss has the lowest slope on both axes, so its
lead over Bamboo narrows from 24% to 16% across the sweep but holds throughout.

### Dev loop and app size

`tools/dev-scale.mjs` adds *N* generated source files and re-measures. Every module carries identical
declarations, so they fold to the same classes: the first generated module changes Bamboo from
43,420 to 43,604 B and Truss from 28,432 to 28,571 B, then the stylesheets stay flat while only file
count grows.

**Edit → HMR broadcast, ms:**

| Extra source files | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 (as shipped) | 12 | 2 | 2 | 2 |
| 25 | 13 | 2 | 2 | 2 |
| 100 | 13 | 2 | 2 | 2 |
| 400 | 14 | 2 | 2 | 2 |

This column counts the first broadcast of any kind, so it answers "does this engine's own reaction
grow with the inventory" within one engine; it is not a cross-engine comparison, for the reason the
main table's server-reaction row gives.

**There is no per-edit growth with file count.** StyleX, Panda and Truss answer a shared edit in
2 ms at every size; Bamboo sits at 12–14 ms with no slope either. Whole-inventory work is not
flat:

| | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| Production build, 0 → 400 files | 1,574 → 2,044 ms | 2,493 → 3,170 ms | 1,935 → 2,242 ms | 1,014 → 1,251 ms |
| — per added file | 1.18 ms | 1.69 ms | 0.77 ms | 0.59 ms |
| Dev server cold start, 0 → 400 files | 1,604 → 2,474 ms | 1,523 → 2,366 ms | 1,457 → 1,926 ms | 987 → 1,592 ms |
| — per added file | 2.18 ms | 2.11 ms | 1.17 ms | 1.51 ms |

Read the milliseconds, not a percentage: the app is 13 source files, so 400 more is 32× the inventory
and any per-file constant reads as a large percentage off that base. Carried out to 1,600 extra files
(`COUNTS=0,400,800,1600`), the build result is:

| Extra source files | 0 | 400 | 800 | 1,600 | per added file |
| --- | --- | --- | --- | --- | --- |
| Bamboo | 1,533 ms | 2,043 ms | 2,501 ms | 3,414 ms | 1.18 ms |
| StyleX | 2,470 ms | 3,202 ms | 3,758 ms | 4,892 ms | 1.51 ms |
| Panda | 1,936 ms | 2,222 ms | 2,418 ms | 2,858 ms | 0.58 ms |
| Truss | 997 ms | 1,261 ms | 1,466 ms | 1,901 ms | 0.57 ms |

**This is where the main table's build rows stop generalising, but only for Bamboo against Panda.**
Truss is fastest at every size and has the lowest slope, so its build win survives the measured
range. Panda crosses Bamboo before 400 extra files and closes on Truss without reaching it. Bamboo
stays ahead of StyleX at 1,600 files by 1.6 s and has the lower slope.

Run the same sweep with `ORPHANED=1` and the generated modules remain inside `include` but outside the
bundle graph:

| Orphaned source files | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 | 1,545 ms | 2,473 ms | 1,948 ms | 1,026 ms |
| 400 | 1,664 ms | 2,445 ms | 2,070 ms | 1,014 ms |
| 800 | 1,726 ms | 2,462 ms | 2,180 ms | 1,002 ms |
| 1,600 | 1,921 ms | 2,472 ms | 2,362 ms | 1,019 ms |
| CSS emitted, 0 → 1,600 | +2 B | **+0 B** | +168 B | **+0 B** |

Over the 400→1,600 segment Bamboo adds 0.21 ms per orphaned file and Panda 0.24 ms; StyleX and
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
| 0 | 7,357 B | 7,008 B | 9,518 B | 5,612 B |
| 2 | 7,357 B | 7,427 B | 9,518 B | 5,939 B |
| 8 | 7,357 B | 8,350 B | 9,518 B | 6,681 B |
| **added per theme** | **0 B** 🏆 | +168 B | **0 B** 🏆 | +134 B |

**Theme payload, fetched only when a theme is selected:**

| Axis | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| Bytes per theme | **1,374 B** 🏆 | n/a (in the stylesheet) | 2,805 B | n/a (in the stylesheet) |
| Themes in the critical path | **none** 🏆 | all of them | **none** 🏆 | all of them |

Two mechanisms, not four. Bamboo and Panda emit each theme as its own artifact loaded on demand, so
first load is flat however many exist. StyleX's `createTheme` and Truss's variable blocks compile into
the linked stylesheet, so every visitor pays for every theme: at eight, StyleX's CSS is **19% larger**
than at zero and Truss's **19%**. Between the lazy two it is the light/dark encoding again, Bamboo
writing `base` and `_osDark` and letting `light-dark()` resolve the rest against Panda's four values,
**2.04× the bytes per theme**. For a site with one fixed brand theme this reverses: a lazy artifact is
a second request for bytes the stylesheet would have carried anyway. Truss's stylesheet is small
enough that it still downloads less at eight themes than any other engine does at zero.


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
its product, not the harness.

</details>

<details>
<summary><strong>Why is the variant row not called "recipes"?</strong></summary>

Because naming it after one engine's API biases it. The question the row asks is whether a component
with discrete states can be declared in one place, with a call site the compiler checks.

Bamboo and Panda answer with `cva`: a base plus a variant matrix, and the accepted props are inferred
from the definition. Truss answers with a documented convention rather than an API — a
`Record<Variant, Properties>` map spread over a base hash, since a `Css.….$` expression is a plain
object. Both are checked. Removing a map entry in the arena app fails the build with TS2741
("Property 'link' is missing … but required in type 'Record<ButtonTone, Properties>'"), and a
mistyped variant at a call site fails with TS2820 and a did-you-mean. The difference is that `cva`
infers the prop type from the definition while the Truss convention declares the union first and
checks the map against it.

StyleX has no single definition point: variants are composed at each call site, so nothing ties the
states of a component together or checks that they are all handled.

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
component edit lands JS last for all but Panda. The flash runs from 0 ms (Panda, Truss) to 78 ms
(Bamboo) ahead of the correct paint on the shared edit.

**Server reaction is the row to read carefully.** It counts the first broadcast that carries an
update payload, not the first broadcast of any kind, because those are not the same event. An engine
may announce "the CSS changed, go refetch" the moment the file watcher fires, before it has compiled
anything, and the stylesheet the browser then refetches still holds the old rule. On the component
edit StyleX pings that way at ~3 ms while its update lands at 80 ms and its rule goes live at
221 ms. Counting only an update payload puts every engine on the same event.

The shared edit has no such figure at all. That probe runs on a bare websocket with no browser
attached, and a shared style module is not in a browserless client's module graph, so no engine
broadcasts an update for it — only pings and React Router's own event. A route module is always
tracked, which is why the component edit still yields a number.

The component-edit server reaction pools 28 runs per engine; the browser-side phases pool 4 traces of
5 edit pairs each.

`HMR payload` counts bytes, not milliseconds, and reproduces exactly.

</details>
