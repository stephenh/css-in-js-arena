// Authoring volume: how many lines of styling code each approach costs.
// Shipped-byte measurements live in bytes.mjs.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { NAMES } from "./engines.mjs";

const ROOT = new URL("../", import.meta.url).pathname;
const APPS = NAMES;
const FILES = ["root.tsx", ...["dashboard", "projects", "settings", "pricing", "docs", "lab"].map((r) => `routes/${r}.tsx`)];

const countLines = (file) => {
  try {
    return readFileSync(file, "utf8").split("\n").filter((l) => l.trim() !== "").length;
  } catch {
    return 0;
  }
};

// Lines inside a style-authoring call: css()/cva()/sva() for Bamboo,
// stylex.create()/defineVars()/createTheme() for StyleX.
const CALL = /(?:\b(?:css|cva|sva)\s*\(\s*\{)|(?:stylex\.(?:create|defineVars|createTheme)\s*\()/;

// Truss has no call to bracket: a style is a `Css.….$` chain, one or many
// lines, so count from the line that opens a chain to the line that ends it.
const CHAIN_OPEN = /\bCss\./;
const CHAIN_CLOSE = /\.\$/;

// Tailwind: a `cva()` recipe, a `const` bound to a class string, or the
// `const s = { … }` / `const schemes = { … }` map of them.
const TW_OPEN = /^(?:export\s+)?const\s+(?:[\w$]+(?:\s*:\s*[^=]+?)?\s*=\s*(?:cva\(|")|(?:s|schemes)(?:\s*:\s*[^=]+?)?\s*=\s*\{)/;
const TW_CONTINUED = /^(?:export\s+)?const\s+[\w$]+(?:\s*:\s*[^=]+?)?\s*=\s*$/;
const TW_VALUE = /^\s*"/;

function styleLines(file) {
  if (file.includes("/apps/truss/")) return trussStyleLines(file);
  if (file.includes("/apps/tailwind/")) return tailwindStyleLines(file);
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    return 0;
  }
  let depth = 0;
  let inBlock = false;
  let count = 0;
  for (const line of src.split("\n")) {
    if (!inBlock && CALL.test(line)) {
      inBlock = true;
      depth = 0;
    }
    if (inBlock) {
      if (line.trim() !== "") count++;
      for (const ch of line) {
        if (ch === "(" || ch === "{") depth++;
        if (ch === ")" || ch === "}") depth--;
      }
      if (depth <= 0) inBlock = false;
    }
  }
  return count;
}

/** Non-blank lines that belong to a `Css.….$` chain. */
function trussStyleLines(file) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    return 0;
  }
  let inChain = false;
  let count = 0;
  for (const line of src.split("\n")) {
    if (!inChain && CHAIN_OPEN.test(line)) inChain = true;
    if (inChain) {
      if (line.trim() !== "") count++;
      if (CHAIN_CLOSE.test(line)) inChain = false;
    }
  }
  return count;
}

/**
 * Non-blank lines that define a Tailwind style.
 *
 * A Tailwind style is a plain class string, so there is no call to bracket the
 * way `css({ … })` brackets a Bamboo one. Three shapes count: a `cva()` recipe,
 * a `const` bound to a class string, and the `const s = { … }` map of class
 * strings at the foot of a route. `schemes` in root.tsx is that same map under
 * another name. Records that hold non-style values — `nextTheme`, `themeIcon` —
 * are not matched, so they stay out of the count.
 */
function tailwindStyleLines(file) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    return 0;
  }
  let depth = 0;
  let inBlock = false;
  let pending = false;
  let count = 0;
  for (const line of src.split("\n")) {
    if (!inBlock && (TW_OPEN.test(line) || (pending && TW_VALUE.test(line)))) {
      inBlock = true;
      depth = 0;
    }
    // `export const cardHead =` wraps its string onto the next line.
    pending = !inBlock && TW_CONTINUED.test(line);
    if (!inBlock) continue;
    if (line.trim() !== "") count++;
    for (const ch of line) {
      if (ch === "(" || ch === "{") depth++;
      if (ch === ")" || ch === "}") depth--;
    }
    if (depth <= 0 && /;\s*$/.test(line)) inBlock = false;
  }
  return count;
}

const styling = {
  bamboo: {
    "bamboo.config.ts (tokens)": countLines(join(ROOT, "apps/bamboo/bamboo.config.ts")),
    "ui.ts (recipes)": styleLines(join(ROOT, "apps/bamboo/app/ui.ts")),
  },
  stylex: {
    "reset.css (vendored preflight)": countLines(join(ROOT, "apps/stylex/app/reset.css")),
    "tokens.stylex.ts": styleLines(join(ROOT, "apps/stylex/app/tokens.stylex.ts")),
    "themes.stylex.ts": styleLines(join(ROOT, "apps/stylex/app/themes.stylex.ts")),
    "ui.ts": styleLines(join(ROOT, "apps/stylex/app/ui.ts")),
  },
  panda: {
    "panda.config.ts (tokens)": countLines(join(ROOT, "apps/panda/panda.config.ts")),
    "index.css (layer order)": countLines(join(ROOT, "apps/panda/app/index.css")),
    "ui.ts (recipes)": styleLines(join(ROOT, "apps/panda/app/ui.ts")),
  },
  truss: {
    "truss-config.ts (tokens)": countLines(join(ROOT, "apps/truss/truss-config.ts")),
    "reset.css (vendored preflight)": countLines(join(ROOT, "apps/truss/app/reset.css")),
    "theme.css.ts (light-dark tokens)": countLines(join(ROOT, "apps/truss/app/theme.css.ts")),
    "ui.ts": styleLines(join(ROOT, "apps/truss/app/ui.ts")),
    // Selectors a chain cannot express live beside their route.
    ...Object.fromEntries(
      ["settings", "pricing", "docs", "lab"].map((r) => [
        `routes/${r}.css.ts`,
        countLines(join(ROOT, `apps/truss/app/routes/${r}.css.ts`)),
      ]),
    ),
  },
  tailwind: {
    "app.css (tokens + base)": countLines(join(ROOT, "apps/tailwind/app/app.css")),
    "cn.ts (tailwind-merge config)": countLines(join(ROOT, "apps/tailwind/app/cn.ts")),
    "ui.ts (recipes)": styleLines(join(ROOT, "apps/tailwind/app/ui.ts")),
    // Selectors no utility can express live beside their route.
    ...Object.fromEntries(
      ["settings", "pricing", "docs", "lab"].map((r) => [
        `routes/${r}.css`,
        countLines(join(ROOT, `apps/tailwind/app/routes/${r}.css`)),
      ]),
    ),
  },
};
for (const app of APPS) {
  for (const f of FILES) styling[app][f] = styleLines(join(ROOT, "apps", app, "app", f));
}

const componentLines = Object.fromEntries(
  APPS.map((app) => [app, FILES.reduce((sum, f) => sum + countLines(join(ROOT, "apps", app, "app", f)), 0)]),
);

const totals = {};
console.log("\n============ AUTHORING VOLUME (non-blank lines) ============\n");
for (const app of APPS) {
  const rows = styling[app];
  const styleTotal = Object.values(rows).reduce((a, c) => a + c, 0);
  totals[app] = { styleTotal, components: componentLines[app], all: styleTotal + componentLines[app] };
  console.log(`${app}:`);
  for (const [k, v] of Object.entries(rows)) if (v) console.log(`  ${k.padEnd(32)} ${String(v).padStart(5)}`);
  console.log(`  ${"— styling code".padEnd(32)} ${String(styleTotal).padStart(5)}`);
  console.log(`  ${"— component files (6)".padEnd(32)} ${String(componentLines[app]).padStart(5)}`);
  console.log(`  ${"— TOTAL".padEnd(32)} ${String(totals[app].all).padStart(5)}\n`);
}

for (const app of APPS.slice(1)) {
  const d = totals[app].all - totals[APPS[0]].all;
  console.log(`${app} − ${APPS[0]}: ${d > 0 ? "+" : ""}${d} lines (${((d / totals[APPS[0]].all) * 100).toFixed(1)}%)`);
}
