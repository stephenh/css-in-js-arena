// How much of the shipped stylesheet can never apply?
//
// A class rule is reachable only if its class token appears somewhere in the
// artifacts the browser receives — any client JS chunk, or any server-rendered
// document. A class that appears in neither can never be put on an element, so
// its rule is dead weight regardless of media queries or interaction state.
import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

import { ENGINES } from "./engines.mjs";

const ROOT = new URL("../", import.meta.url).pathname;
const APPS = ENGINES.map((e) => [e.name, e.port]);
const ROUTES = ["/", "/projects", "/settings", "/pricing", "/docs", "/lab"];

// Split a stylesheet into top-level-ish rules, descending through at-rules that
// wrap other rules (@media, @supports, @layer) so nested rules are seen too.
function* rules(css) {
  let i = 0;
  const emit = function* (text, offset) {
    let depth = 0;
    let start = 0;
    for (let j = 0; j < text.length; j++) {
      const ch = text[j];
      if (ch === "{") {
        if (depth === 0) var selEnd = j;
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const selector = text.slice(start, selEnd).trim();
          const body = text.slice(selEnd + 1, j);
          if (selector.startsWith("@") && /\{/.test(body)) {
            yield* emit(body, offset + selEnd + 1);
          } else if (!selector.startsWith("@")) {
            yield { selector, length: j - start + 1 };
          }
          start = j + 1;
        }
      }
    }
  };
  yield* emit(css, i);
}

// `.fs_12\.5px` in a selector is the class token `fs_12.5px` in markup.
const unescape = (s) => s.replace(/\\(.)/g, "$1");

const report = {};

for (const [app, port] of APPS) {
  const clientAssets = join(ROOT, "apps", app, "build/client/assets");
  const files = readdirSync(clientAssets);

  const html = execSync(`curl -s http://127.0.0.1:${port}/`, { maxBuffer: 60e6 }).toString();
  const cssHref = [...html.matchAll(/href="\/assets\/([^"]+\.css)"/g)].map((m) => m[1]);
  const css = cssHref.map((f) => readFileSync(join(clientAssets, f), "utf8")).join("\n");

  // Everything the browser could ever receive.
  const jsOnly = files.filter((f) => f.endsWith(".js")).map((f) => readFileSync(join(clientAssets, f), "utf8")).join("\n");
  let haystack = jsOnly;
  for (const r of ROUTES) {
    haystack += execSync(`curl -s http://127.0.0.1:${port}${r}`, { maxBuffer: 60e6 }).toString();
  }

  // A class rule can only be judged unreachable if the engine folds class names
  // to literals at build time — then absence from the bundle proves the class
  // can never be applied. An engine that resolves class names at runtime never
  // puts them in the JS at all, so a rule for a hover/checked/media state that
  // the captured HTML does not happen to contain looks dead when it is not.
  // Detect that from the JS bundles and report n/a rather than a false number.
  // Tolerate whitespace before the brace — the stylesheet is not minified.
  // Scan selector text only: a decimal inside a declaration (`0.15s,`) looks
  // exactly like a class token, and a phantom token drags the fold ratio down.
  const allTokens = [...new Set([...selectorText(css).matchAll(/\.((?:\\.|[\w-])+)(?=[\s,{:>+~[)])/g)].map((m) => unescape(m[1])))];
  // Whole-token match: `.br4` must not count as literal because the JS happens
  // to contain `br40` somewhere.
  const literal = allTokens.filter((t) => new RegExp(`(?<![\\w-])${escapeRe(t)}(?![\\w-])`).test(jsOnly)).length;
  const foldsToLiterals = allTokens.length > 0 && literal / allTokens.length > 0.5;

  let total = 0;
  let dead = 0;
  let deadRules = 0;
  let liveRules = 0;
  const deadSample = [];
  const deadCss = [];

  for (const { selector, length } of rules(css)) {
    total += length;
    const classes = [...selector.matchAll(/\.((?:\\.|[\w-])+)/g)].map((m) => unescape(m[1]));
    if (classes.length === 0) {
      liveRules++; // element/pseudo selector — always reachable
      continue;
    }
    // Reachable if every class it needs can actually appear.
    const reachable = classes.every((c) => haystack.includes(c));
    if (reachable) {
      liveRules++;
    } else {
      dead += length;
      deadRules++;
      if (deadSample.length < 6) deadSample.push(selector.slice(0, 70));
    }
  }

  report[app] = { total, dead, deadRules, liveRules, deadSample, cssHref, foldsToLiterals, literal, allTokens: allTokens.length };
}

const n = (x) => x.toLocaleString("en-US");
console.log("\n================ UNREACHABLE CSS ================\n");
for (const [app] of APPS) {
  const r = report[app];
  console.log(`${app}:`);
  console.log(`  stylesheet            ${r.cssHref.join(", ")}`);
  const pctLiteral = ((r.literal / r.allTokens) * 100).toFixed(0);
  console.log(`  class names literal   ${n(r.literal)} of ${n(r.allTokens)} in the JS (${pctLiteral}%)`);
  if (!r.foldsToLiterals) {
    console.log(`  reachability          n/a — runtime class resolution`);
    console.log(`                        the rest are computed in the browser, so static`);
    console.log(`                        reachability cannot be judged.`);
  } else {
    const pct = ((r.dead / r.total) * 100).toFixed(1);
    console.log(`  rules                 ${n(r.liveRules)} reachable · ${n(r.deadRules)} unreachable`);
    console.log(`  bytes in rules        ${n(r.total)} total · ${n(r.dead)} unreachable (${pct}%)`);
    if (r.deadSample.length) console.log(`  examples              ${r.deadSample.join("\n                        ")}`);
  }
  console.log("");
}

/**
 * The selector parts of a stylesheet, with every declaration block dropped.
 *
 * A brace-depth walk: text at depth 0 is a selector or at-rule prelude, and so
 * is text inside a conditional group rule (`@media`, `@container`, `@supports`,
 * `@layer`), which holds further rules rather than declarations. Everything
 * else — a plain rule body, and the body of `@keyframes` or `@property` — is
 * declaration text and is discarded. Conservative: it can only drop tokens, and
 * a dropped selector would show up as an unreachable rule, not a silent pass.
 *
 * I.e. `@media (x) { .a:hover { transform: scale(0.82); } }` yields
 * `@media (x) .a:hover`, so `.a` is a token and the `.82` in `scale()` is not.
 */
function selectorText(css) {
  const GROUP = /^\s*@(media|container|supports|layer)\b/;
  const out = [];
  const isGroup = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c !== "{" && c !== "}") continue;
    const chunk = css.slice(start, i);
    if (c === "{") {
      if (depth === 0 || isGroup[depth - 1]) out.push(chunk);
      isGroup[depth] = depth === 0 || isGroup[depth - 1] ? GROUP.test(chunk) : false;
      depth++;
    } else {
      if (depth > 0 && isGroup[depth - 1]) out.push(chunk);
      depth = Math.max(0, depth - 1);
    }
    start = i + 1;
  }
  if (depth === 0) out.push(css.slice(start));
  return out.join("\n");
}

/** Escapes a class token for use inside a RegExp. */
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
