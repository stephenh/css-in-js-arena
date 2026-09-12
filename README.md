# CSS-in-JS Arena

Benchmark harness for **compile-time CSS engines**. Each engine gets its own React Router 8 app under
`apps/`, all rendering the same six-page admin console: identical markup, design and data, verified
pixel-identical before anything is measured.

| Engine | Integration | Version |
| --- | --- | --- |
| [Bamboo CSS](https://bamboocss.com) | `@bamboocss/vite` | 1.55.0 |
| [StyleX](https://stylexjs.com) | `@stylexjs/unplugin` | 0.19.0 |
| [Panda CSS](https://panda-css.com) | `@pandacss/postcss` | 1.12.0 |
| [Truss](https://github.com/homebound-team/truss) | `@homebound/truss/plugin` | 2.32.0 |

Measured 2026-09-12 · Linux, Node 26.8, Vite 8.2.2

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
| Full first load | 105,605 B | 106,122 B | 112,835 B | **104,918 B** 🏆 |
| CSS, brotli | 7,357 B | 7,008 B | 9,518 B | **5,688 B** 🏆 |
| CSS, gzip | 8,627 B | 8,200 B | 11,489 B | **6,721 B** 🏆 |
| CSS, raw | 43,420 B | 40,430 B | 54,007 B | **28,947 B** 🏆 |
| CSS rules emitted *(not a quality axis)* | 463 | 467 | 532 | 458 |
| Client JS, brotli | **92,712 B** 🏆 | **93,583 B** 🏆 | 97,778 B | **94,064 B** 🏆 |
| SSR HTML, gzip, mean of 6 | 5,536 B | 5,531 B | 5,539 B | **5,166 B** 🏆 |
| Class attribute bytes, raw | 93,036 B | 70,843 B | 92,738 B | **67,696 B** 🏆 |
| Class attribute bytes, selector-heavy route | 11,728 B | 11,754 B | 11,685 B | **8,220 B** 🏆 |
| Unreachable CSS shipped | **0 B** 🏆 | 344 B | n/a (runtime) | **0 B** 🏆 |
| Orphan file in `include` (50 styles), imported by nothing | +2 B | **+0 B** 🏆 | +13,200 B | **+0 B** 🏆 (no `include`; compiles the bundle graph) |
| Stylesheets emitted | **1** 🏆 | 2 (one unreferenced) | **1** 🏆 | **1** 🏆 |
| **Build & dev** | | | | |
| Production build, cold | 1,625 ms | 2,614 ms | 2,058 ms | **1,051 ms** 🏆 (codegen committed, not run per build) |
| Production build, warm | 1,600 ms | 2,589 ms | 2,040 ms | **1,074 ms** 🏆 |
| Dev server cold start | 1,788 ms | 1,723 ms | 1,654 ms | **1,170 ms** 🏆 |
| Shared edit → server reacts *(not measurable: no update payload reaches a browserless client)* | — | — | — | — |
| Shared edit → correct paint | 165 ms | 132 ms | 132 ms | **76 ms** 🏆 |
| Component edit → server reacts | 23 ms | 80 ms | **7 ms** 🏆 | 19 ms |
| Component edit → correct paint | 132 ms | 243 ms | 120 ms | **107 ms** 🏆 |
| HMR payload, one shared edit | 342 KB · 9 | 356 KB · 10 | 402 KB · 9 | **334 KB · 8** 🏆 |
| **Authoring** | | | | |
| Total lines written | 3,921 | 4,090 | 3,930 | **2,323** 🏆 (one line per style) |
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
| Delete a page → CSS shrinks | **−22.0%** 🏆 | −8.4% | −13.5% | −12.8% |
| Class names folded to literals | **522 / 522** 🏆 | **453 / 458** 🏆 | 25 / 529 (rest computed in browser, 14.7 KB runtime chunk) | **440 / 440** 🏆 |
| | | | | |
| **Rows won**, of 31 scored 🏆 | **14** | **5** | **9** | **29** |

---

## Where the main table doesn't generalise

One app, one configuration. Three things move the answer: style count, file count, theme count.

### Style volume

The arena is 570 rule blocks. `tools/scale.mjs` generates *N* all-distinct style definitions and
measures the emitted stylesheet.

**Downloaded stylesheet, brotli, relative to Bamboo:**

| Style definitions | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 (as shipped) | ref | −4.7% | +29.4% | −22.7% |
| 50 | ref | +9.8% | +26.0% | −21.4% |
| 200 | ref | +42.1% | +21.0% | −19.5% |
| 800 | ref | **+96.0%** | **+12.3%** | **−16.1%** |

| | Marginal cost per declaration | Gap to Bamboo at n=0 | at n=800 |
| --- | --- | --- | --- |
| Bamboo | 44.0 B raw · 2.0 B brotli | ref | ref |
| Panda | 40.3 B raw · 2.0 B brotli | +10,587 B | −7,013 B |
| StyleX | 65.8 B raw · 5.5 B brotli | −2,990 B | +101,809 B |
| Truss | 33.4 B raw · 1.8 B brotli | −14,473 B | −65,273 B |

**The baseline ranking does not fully survive added style volume.** StyleX starts below Bamboo and
crosses it before 50 generated definitions: it is almost pure slope, since every rule carries
`:not(#\#)` specificity padding that repeats per declaration and compresses badly. Bamboo and Panda
add 2.0 B brotli per declaration, so Panda's compressed penalty stays close to 2.1 KB even though its
lower raw slope crosses Bamboo by 800 definitions. Truss has the lowest slope on both axes, so its
lead over Bamboo narrows from 23% to 16% across the sweep but holds throughout.

### Dev loop and app size

`tools/dev-scale.mjs` adds *N* generated source files and re-measures. Every module carries identical
declarations, so they fold to the same classes: the first generated module changes Bamboo from
43,420 to 43,604 B and Truss from 28,947 to 29,086 B, then the stylesheets stay flat while only file
count grows.

**Edit → HMR broadcast, ms:**

| Extra source files | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 (as shipped) | 13 | 2 | 2 | 2 |
| 25 | 15 | 3 | 3 | 3 |
| 100 | 13 | 2 | 2 | 2 |
| 400 | 14 | 2 | 3 | 2 |

This column counts the first broadcast of any kind, so it answers "does this engine's own reaction
grow with the inventory" within one engine; it is not a cross-engine comparison, for the reason the
main table's server-reaction row gives.

**There is no per-edit growth with file count.** StyleX, Panda and Truss answer a shared edit in
2–3 ms at every size; Bamboo sits at 13–15 ms with no slope either. Whole-inventory work is not
flat:

| | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| Production build, 0 → 400 files | 1,571 → 2,151 ms | 2,586 → 3,273 ms | 2,011 → 2,328 ms | 1,102 → 1,331 ms |
| — per added file | 1.45 ms | 1.72 ms | 0.79 ms | 0.57 ms |
| Dev server cold start, 0 → 400 files | 1,699 → 2,535 ms | 1,641 → 2,602 ms | 1,581 → 2,017 ms | 1,089 → 1,658 ms |
| — per added file | 2.09 ms | 2.40 ms | 1.09 ms | 1.42 ms |

Read the milliseconds, not a percentage: the app is 13 source files, so 400 more is 32× the inventory
and any per-file constant reads as a large percentage off that base. Carried out to 1,600 extra files
(`COUNTS=0,400,800,1600`), the build result is:

| Extra source files | 0 | 400 | 800 | 1,600 | per added file |
| --- | --- | --- | --- | --- | --- |
| Bamboo | 1,625 ms | 2,175 ms | 2,654 ms | 3,625 ms | 1.25 ms |
| StyleX | 2,600 ms | 3,402 ms | 3,975 ms | 5,220 ms | 1.64 ms |
| Panda | 2,061 ms | 2,326 ms | 2,553 ms | 3,025 ms | 0.60 ms |
| Truss | 1,102 ms | 1,342 ms | 1,551 ms | 2,024 ms | 0.58 ms |

**This is where the main table's build rows stop generalising, but only for Bamboo against Panda.**
Truss is fastest at every size and has the lowest slope, so its build win survives the measured
range. Panda crosses Bamboo before 400 extra files and closes on Truss without reaching it. Bamboo
stays ahead of StyleX at 1,600 files by 1.6 s and has the lower slope.

Run the same sweep with `ORPHANED=1` and the generated modules remain inside `include` but outside the
bundle graph:

| Orphaned source files | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| 0 | 1,619 ms | 2,644 ms | 2,078 ms | 1,066 ms |
| 400 | 1,722 ms | 2,605 ms | 2,174 ms | 1,046 ms |
| 800 | 1,832 ms | 2,584 ms | 2,287 ms | 1,077 ms |
| 1,600 | 2,006 ms | 2,592 ms | 2,471 ms | 1,061 ms |
| CSS emitted, 0 → 1,600 | +2 B | **+0 B** | +168 B | **+0 B** |

Over the 400→1,600 segment Bamboo adds 0.24 ms per orphaned file and Panda 0.25 ms; StyleX and
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
| 0 | 7,357 B | 7,008 B | 9,518 B | 5,688 B |
| 2 | 7,357 B | 7,427 B | 9,518 B | 5,973 B |
| 8 | 7,357 B | 8,350 B | 9,518 B | 6,734 B |
| **added per theme** | **0 B** 🏆 | +168 B | **0 B** 🏆 | +131 B |

**Theme payload, fetched only when a theme is selected:**

| Axis | Bamboo | StyleX | Panda | Truss |
| --- | --- | --- | --- | --- |
| Bytes per theme | **1,374 B** 🏆 | n/a (in the stylesheet) | 2,805 B | n/a (in the stylesheet) |
| Themes in the critical path | **none** 🏆 | all of them | **none** 🏆 | all of them |

Two mechanisms, not four. Bamboo and Panda emit each theme as its own artifact loaded on demand, so
first load is flat however many exist. StyleX's `createTheme` and Truss's variable blocks compile into
the linked stylesheet, so every visitor pays for every theme: at eight, StyleX's CSS is **19% larger**
than at zero and Truss's **18%**. Between the lazy two it is the light/dark encoding again, Bamboo
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
