import { Css } from "~/Css";

/**
 * The run log's structural and relational selectors, and the keyframes the
 * motion section names. One class on the table; row position, the divider
 * rule and the tint below a failed run are all selectors, so nothing is
 * computed in JavaScript and no class varies per row.
 */
export const css = {
  ".runTable th": Css.tal.pyPx(9).pxPx(12).f11_5.fw6.add("letterSpacing", "0.03em").ttu.faint.bb.bcBorder.$,
  ".runTable td": Css.pyPx(10).pxPx(12).text.$,
  ".runTable tbody tr:nth-child(even)": Css.bgSurface2.$,
  ".runTable tbody tr:not(:last-child) td": Css.bb.bcBorder.$,
  // `~` not `+`: StyleX's relational API has no next-sibling form, so the
  // general-sibling combinator is the strongest relation every app can express.
  ".runTable tbody tr[data-state='failed'] ~ tr": Css.add(
    "boxShadow",
    "inset 3px 0 0 color-mix(in srgb, var(--danger) 40%, transparent)",
  ).$,
  // Matches `th` as well as `td`, so the numeric headers align with their columns.
  ".runTable [data-numeric='true']": Css.tar.add("fontVariantNumeric", "tabular-nums").muted.$,
  ".runTable tbody tr:hover td": Css.bgSurface3.$,

  // Motion. Truss has no keyframes API; the blocks are raw CSS in the same file.
  "@keyframes spin": Css.raw`
    to { transform: rotate(360deg); }
  `,
  "@keyframes pulse": Css.raw`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.82); }
  `,
  "@keyframes shimmer": Css.raw`
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  `,
  "@keyframes sweep": Css.raw`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `,
};
