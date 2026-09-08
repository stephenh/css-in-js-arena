import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";

/**
 * Lets a server-rendered app link Truss's stylesheet.
 *
 * `trussPlugin` collects atomic rules while Vite transforms modules and emits
 * them as `assets/truss-<hash>.css`, then writes a `<link>` into `index.html`.
 * React Router renders its document from `root.tsx` and has no `index.html`,
 * so nothing would reference that file. This plugin gives the app an
 * `import "virtual:truss.css"` module instead: a placeholder stylesheet that
 * React Router links like any other CSS import, filled with Truss's emitted
 * CSS once the bundle is complete, so the browser downloads one stylesheet.
 *
 * In dev the placeholder stays empty and Truss's own runtime script fills a
 * `<style>` tag from `/virtual:truss.css`; root.tsx wires that up.
 *
 * It also takes over the `?truss-css` side-effect import Truss adds for every
 * `.css.ts` module. Truss answers that import with a comment-only stylesheet,
 * which Vite would bundle as a per-route CSS file the document has to link.
 * Here it resolves to the `.css.ts` module itself, so Truss transforms the
 * file and registers its rules as usual, and the module is then blanked once
 * Truss has seen it so the `Css` builder never reaches the bundle. Must be
 * listed before `trussPlugin` so its `resolveId` runs first.
 */
export function trussSsr(): Plugin {
  const ID = "virtual:truss.css";
  const RESOLVED = `\0${ID}`;
  const PLACEHOLDER = ".__truss_ssr_css__{--truss:0}";
  const SIDE_EFFECT_QUERY = "?truss-css";

  return {
    name: "truss-ssr",
    enforce: "pre",
    resolveId(id, importer) {
      if (id === ID) return RESOLVED;
      if (id.endsWith(SIDE_EFFECT_QUERY) && importer) {
        return resolve(dirname(importer), id.slice(0, -SIDE_EFFECT_QUERY.length));
      }
      return null;
    },
    load(id) {
      return id === RESOLVED ? PLACEHOLDER : null;
    },
    transform: {
      order: "post",
      handler(_code, id) {
        return id.endsWith(".css.ts") ? { code: "export {};", map: null } : null;
      },
    },
    // Post, so it runs after `trussPlugin` has emitted its asset.
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const emitted = Object.values(bundle).find(
          (item) => item.type === "asset" && /^assets\/truss-[0-9a-f]+\.css$/.test(item.fileName),
        );
        if (!emitted || emitted.type !== "asset") return;
        const css = String(emitted.source);
        for (const item of Object.values(bundle)) {
          if (item.type !== "asset" || !item.fileName.endsWith(".css")) continue;
          const source = String(item.source);
          if (!source.includes(PLACEHOLDER)) continue;
          item.source = source.replace(PLACEHOLDER, css);
        }
        delete bundle[emitted.fileName];
      },
    },
  };
}
