import { defineConfig, newMethod, newMethodsForProp, type FontConfig } from "@homebound/truss";

/**
 * Design tokens. Values are identical to the ones the Bamboo app declares in
 * bamboo.config.ts — every app must render the same pixels.
 *
 * Truss has no token layer of its own: its palette is a flat name → value map
 * that becomes `Css.accent` / `Css.bgAccent` / `Css.bcAccent` methods. The
 * theme-aware values are CSS custom properties, declared once as
 * `light-dark()` pairs in app/theme.css.ts, so `color-scheme` on a subtree
 * drives the explicit toggle exactly as it does for Bamboo.
 */
const palette = {
  // Named `Page`, not `Bg`: a palette entry named `Bg` generates `Css.bg` for
  // its colour form, which collides with the `background` shorthand method
  // Truss 2.33.0 added under the same name, and the generated Css.ts then
  // has a duplicate identifier. The custom property keeps its `--bg` name.
  Page: "var(--bg)",
  Surface: "var(--surface)",
  Surface2: "var(--surface2)",
  Surface3: "var(--surface3)",
  Border: "var(--border)",
  BorderStrong: "var(--border-strong)",
  Text: "var(--text)",
  Muted: "var(--muted)",
  Faint: "var(--faint)",
  Accent: "var(--accent)",
  AccentSoft: "var(--accent-soft)",
  AccentContrast: "var(--accent-contrast)",
  Success: "var(--success)",
  SuccessSoft: "var(--success-soft)",
  Warning: "var(--warning)",
  WarningSoft: "var(--warning-soft)",
  Danger: "var(--danger)",
  DangerSoft: "var(--danger-soft)",

  // Derived once from the theme-aware tokens above, so these need no dark
  // branch of their own — light-dark() resolves underneath.
  AccentHover: "color-mix(in srgb, var(--accent) 86%, #000)",
  DangerHover: "color-mix(in srgb, var(--danger) 86%, #000)",
  SurfaceGlass: "color-mix(in srgb, var(--surface) 86%, transparent)",
  SurfaceGlassStrong: "color-mix(in srgb, var(--surface) 92%, transparent)",
  BarSecondary: "color-mix(in srgb, var(--accent) 32%, transparent)",
  AccentBorder: "color-mix(in srgb, var(--accent) 30%, transparent)",
  WarningBorder: "color-mix(in srgb, var(--warning) 34%, transparent)",
  DangerBorder: "color-mix(in srgb, var(--danger) 40%, transparent)",

  White: "#fff",
  Transparent: "transparent",
  Current: "currentColor",
  Inherit: "inherit",
};

// The type scale. Truss fonts are `fN` abbreviations; `_5` marks a half pixel.
const fonts: FontConfig = {
  f10: "10px",
  f11: "11px",
  f11_5: "11.5px",
  f12: "12px",
  f12_5: "12.5px",
  f13: "13px",
  f13_5: "13.5px",
  f14: "14px",
  f14_5: "14.5px",
  f15: "15px",
  f15_5: "15.5px",
  f16: "16px",
  f17: "17px",
  f18: "18px",
  f19: "19px",
  f23: "23px",
  f25: "25px",
  f28: "28px",
  f34: "34px",
};

// The design is desktop-first, so every query is a max-width range. Truss
// breakpoints are contiguous ranges named by their lower edge, so
// `ifTabletAndDown` is `(max-width: 900px)` and `ifLapAndUp` is `(min-width: 901px)`.
// Where two ranges match the same element Truss orders the rules by width, so
// the narrower `max-width` query wins.
const breakpoints = {
  tiny: 0, // ifTiny            (max-width: 460px)
  phone: 461, // ifPhoneAndDown  (max-width: 560px)
  form: 561, // ifFormAndDown    (max-width: 620px)
  stack: 621, // ifStackAndDown  (max-width: 820px)
  narrow: 821, // ifNarrowAndDown (max-width: 860px)
  tablet: 861, // ifTabletAndDown (max-width: 900px)
  lap: 901, // ifLapAndDown      (max-width: 1000px), ifLapAndUp (min-width: 901px)
  wide: 1001, // ifWideAndDown   (max-width: 1150px)
  xl: 1151,
};

const sections = {
  // The design's radius scale replaces Truss's rem-based defaults.
  borderRadius: () =>
    newMethodsForProp("borderRadius", {
      br2: "2px",
      br4: "4px",
      br6: "6px",
      br7: "7px",
      br10: "10px",
      br14: "14px",
      brPill: "999px",
    }),
  boxShadow: () =>
    newMethodsForProp("boxShadow", {
      shadowNone: "none",
      shadowSm: "var(--shadow-sm)",
      shadowMd: "var(--shadow-md)",
      shadowLg: "var(--shadow-lg)",
      // Focus rings, 3px of the soft tone.
      shadowRing: "0 0 0 3px var(--accent-soft)",
      shadowRingDanger: "0 0 0 3px var(--danger-soft)",
    }),
  fontFamily: () =>
    newMethodsForProp("fontFamily", {
      fontMono:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }),
  // `newMethod`, not `newMethodsForProp`: the latter also emits a generic
  // `outlineColor(value)`, which Truss 2.33.0 now generates itself, and the
  // two collide. Only the named `ocAccent` is wanted here.
  outlineColor: () => [newMethod("ocAccent", { outlineColor: "var(--accent)" })],
  // Three named transitions, so no component writes the `transitionProperty` /
  // `transitionDuration` pair by hand. Each is one `transition` shorthand, and
  // one shorthand is one atomic rule; the longhand pair was two rules per
  // distinct property list. Timing function is left at the `ease` default.
  transition: () => [
    // The default. Covers every state change the console animates at 0.15s:
    // hover fills, hover and focus borders, hover text, and the focus ring.
    newMethod("transition", {
      transition: "background-color 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s",
    }),
    // Table row hover, which is quicker so a cursor dragging down a long table
    // does not trail colour behind it.
    newMethod("transitionFast", { transition: "background-color 0.12s" }),
    // The settings switch: the track fills while its knob slides.
    newMethod("transitionSlow", { transition: "background-color 0.18s, transform 0.18s" }),
  ],
  gradients: () => [
    newMethod("brandGradient", {
      backgroundImage: "linear-gradient(140deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #22d3ee))",
    }),
    newMethod("shimmerGradient", {
      backgroundImage:
        "linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 32%, transparent), var(--accent))",
    }),
  ],
};

// Motion for the /lab route. Declared in the config rather than as raw blocks
// in a `.css.ts` so Truss owns the name: it type-checks the animations that
// reference it and writes the block only while one still does.
const keyframes = {
  spin: { to: { transform: "rotate(360deg)" } },
  pulse: {
    "0%, 100%": { opacity: "1", transform: "scale(1)" },
    "50%": { opacity: "0.45", transform: "scale(0.82)" },
  },
  shimmer: {
    from: { backgroundPosition: "200% 0" },
    to: { backgroundPosition: "-200% 0" },
  },
  sweep: {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
};

export default defineConfig({
  outputPath: "./app/Css.ts",
  palette,
  fonts,
  // Off-grid values use the `Px` methods (`Css.ptPx(18)`), so the increment
  // only sets what `mt1`..`mt4` mean.
  increment: 8,
  numberOfIncrements: 4,
  breakpoints,
  keyframes,
  sections,
});
