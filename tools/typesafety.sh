#!/usr/bin/env bash
# Both engines resolve design tokens by name. What happens when the name is
# wrong? Introduces the same typo in each app, then restores.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

probe() {
  local app=$1 file=$2 from=$3 to=$4
  cd "$ROOT/apps/$app"
  cp "$file" /tmp/typesafety-$app.bak

  if ! grep -qF "$from" "$file"; then
    echo "  $app: anchor not found — skipped"
    cp /tmp/typesafety-$app.bak "$file"
    return
  fi
  perl -0pi -e "s/\Q$from\E/$to/" "$file"

  local tsc build
  tsc=$(npm run typecheck 2>&1 | grep -c "error TS")
  if npm run build >/tmp/build-$app.log 2>&1; then build="succeeds"; else build="FAILS"; fi

  printf "  %-8s typecheck: %s error(s)   build: %s\n" "$app" "$tsc" "$build"
  if [ "$tsc" -gt 0 ]; then
    npm run typecheck 2>&1 | grep "error TS" | head -1 | sed 's/^/      /'
  fi
  if [ "$build" = "FAILS" ]; then
    grep -iE "error|invalid|unknown|token" /tmp/build-$app.log | head -2 | sed 's/^/      /'
  fi

  cp /tmp/typesafety-$app.bak "$file"
  npm run build >/dev/null 2>&1
}

echo "=== Typo a colour token: accent -> acent ==="
probe bamboo app/ui.ts 'color: "accent",' 'color: "acent",'
probe panda  app/ui.ts 'color: "accent",' 'color: "acent",'
probe stylex app/ui.ts 'color: t.accent,' 'color: t.acent,'
probe truss  app/ui.ts '.accent.fw6' '.acent.fw6'
probe tailwind app/ui.ts 'staging: "bg-accent-soft text-accent",' 'staging: "bg-accent-soft text-acent",'

echo
echo "=== Typo a CSS property: paddingBlock -> padingBlock ==="
probe bamboo app/ui.ts 'paddingBlock: "8px",' 'padingBlock: "8px",'
probe panda  app/ui.ts 'paddingBlock: "8px",' 'padingBlock: "8px",'
probe stylex app/ui.ts 'paddingBlock: 8,' 'padingBlock: 8,'
# Truss spells the common properties as abbreviations; `add()` is where a
# property name is typed out, so that is where the typo goes. Since 2.33.0 the
# abbreviations cover enough that ui.ts has no `add()` left, so the probe moves
# to a route that still types a property name out.
probe truss  app/root.tsx 'add("colorScheme", "light dark")' 'add("colorSchema", "light dark")'
# Tailwind never spells a property out: `py-` is how `paddingBlock` is written,
# so misspelling the utility prefix is the same class of mistake.
probe tailwind app/ui.ts 'gap-6 py-8 px-14' 'gap-6 pyy-8 px-14'
