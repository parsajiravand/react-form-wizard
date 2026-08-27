#!/usr/bin/env bash
#
# Install the packed tarball into a throwaway project and exercise it the way a
# consumer does: typecheck it, import it, require it, render it.
#
# This is the check that would have caught every packaging defect in 1.1.1 —
# the missing type declarations, the empty require(), the self-dependency, and
# the inlined React JSX runtime that broke React 18.
#
# Usage: scripts/verify-consumer.sh <react-major> <tarball-path>

set -uo pipefail

MAJOR="${1:?usage: verify-consumer.sh <react-major> <tarball-path>}"
TARBALL="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
WORKDIR="$(mktemp -d)"

FAILURES=0
pass() { printf '  \033[32mPASS\033[0m %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; FAILURES=$((FAILURES + 1)); }
note() { printf '  \033[33mNOTE\033[0m %s\n' "$1"; }
section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

cd "$WORKDIR" || exit 1
echo '{ "name": "consumer", "version": "1.0.0", "private": true }' > package.json

printf '\033[1m=== Consumer verification: React %s ===\033[0m\n' "$MAJOR"

npm install --silent --no-audit --no-fund \
  "react@$MAJOR" "react-dom@$MAJOR" \
  "@types/react@$MAJOR" "@types/react-dom@$MAJOR" \
  typescript@5 "$TARBALL" > install.log 2>&1 || {
    echo "npm install failed:"; tail -30 install.log; exit 1;
  }

REACT_VERSION="$(node -p "require('react/package.json').version")"
echo "installed react@$REACT_VERSION"

# React 17 predates the package.json "exports" field, so Node's own ESM
# resolver cannot resolve `react/jsx-runtime`. That affects native Node ESM
# only — every bundler resolves it — so those two checks run through a bundle
# on React 17 instead of being skipped.
NATIVE_ESM=1
if [ "$MAJOR" = "17" ]; then NATIVE_ESM=0; fi

# ---------------------------------------------------------------- 1. types
section "1. TypeScript resolution"

cat > app.tsx <<'EOF'
import FormWizard, {
  TabContent,
  useWizard,
  useWizardCursor,
  useWizardData,
  zodValidator,
  hookFormValidator,
  composeValidators,
} from "react-form-wizard-component";
import type {
  FormWizardMethods,
  FormWizardProps,
  FormWizardSchema,
  UseWizardReturn,
  WizardClassNames,
  WizardData,
  WizardTheme,
} from "react-form-wizard-component";

const schema: FormWizardSchema = {
  initialData: { plan: "basic" },
  steps: [
    { id: "a", title: "A", content: <div>a</div> },
    {
      id: "b",
      title: "B",
      condition: ({ data }) => data.plan === "premium",
      validate: ({ data }) => (data.ok ? true : "not ok"),
      content: ({ data }) => <div>{String(data.plan)}</div>,
    },
  ],
};

const theme: WizardTheme = { primaryColor: "#0e6f70", borderRadius: "8px" };
const classNames: WizardClassNames = { root: "r", nextButton: "n" };

export const Styled = (props: FormWizardProps) => (
  <FormWizard
    {...props}
    schema={schema}
    theme={theme}
    persist={{ key: "k", storage: "session" }}
    syncToUrl={{ param: "s" }}
    onComplete={(d?: WizardData) => console.log(d)}
    onTabChange={(e) => console.log(e.prevIndex, e.nextIndex, e.stepId)}
  />
);

export const Unstyled = () => (
  <FormWizard title="t" unstyled classNames={classNames}>
    <TabContent title="One">1</TabContent>
    <FormWizard.TabContent title="Two">2</FormWizard.TabContent>
  </FormWizard>
);

export const Headless = () => {
  const w: UseWizardReturn = useWizard({ stepIds: ["a", "b"] });
  const c = useWizardCursor({ stepIds: ["a"] });
  const d = useWizardData({ initialData: {} });
  return (
    <button onClick={w.next}>
      {w.stepId}/{c.totalSteps}/{String(d.data.x ?? "")}
    </button>
  );
};

export const v1 = zodValidator({ safeParse: () => ({ success: true as const }) });
export const v2 = hookFormValidator({ formState: { errors: {} } }, { fields: ["x"] });
export const v3 = composeValidators(v1, v2);
export type M = FormWizardMethods;
EOF

for MODE in bundler node16 node10; do
  case "$MODE" in
    bundler) MOD="esnext"; RES="bundler" ;;
    node16)  MOD="node16"; RES="node16" ;;
    node10)  MOD="commonjs"; RES="node" ;;
  esac
  cat > "tsconfig.$MODE.json" <<EOF
{ "compilerOptions": {
    "module": "$MOD", "moduleResolution": "$RES", "jsx": "react-jsx",
    "strict": true, "noEmit": true, "skipLibCheck": true,
    "esModuleInterop": true, "target": "ES2020", "lib": ["ES2020", "DOM"] },
  "include": ["app.tsx"] }
EOF
  if npx --no-install tsc -p "tsconfig.$MODE.json" > "tsc.$MODE.log" 2>&1; then
    pass "tsc resolves types under moduleResolution=$RES"
  else
    fail "tsc failed under moduleResolution=$RES"
    sed -n '1,15p' "tsc.$MODE.log"
  fi
done

# ---------------------------------------------------------------- 2. ESM
section "2. ESM import"

cat > esm-check.mjs <<'EOF'
import * as m from "react-form-wizard-component";
const need = [
  "default", "FormWizard", "TabContent",
  "useWizard", "useWizardCursor", "useWizardData",
  "zodValidator", "hookFormValidator", "composeValidators",
];
const missing = need.filter((k) => !(k in m));
if (missing.length) {
  console.error("missing exports: " + missing.join(", "));
  process.exit(1);
}
if (typeof m.useWizard !== "function") {
  console.error("useWizard is not callable");
  process.exit(1);
}
console.log("exports ok: " + Object.keys(m).sort().join(", "));
EOF

if [ "$NATIVE_ESM" = "1" ]; then
  if node esm-check.mjs > esm.log 2>&1; then
    pass "ESM import exposes every documented export"
  else
    fail "ESM import failed"; sed -n '1,10p' esm.log
  fi
else
  note "native Node ESM skipped on React 17 (React 17 has no exports field)"
fi

# ---------------------------------------------------------------- 3. CJS
section "3. CommonJS require()"

cat > cjs-check.cjs <<'EOF'
const m = require("react-form-wizard-component");
const component = m.default ?? m.FormWizard;
if (!component) {
  console.error("require() returned no component; keys: " + JSON.stringify(Object.keys(m)));
  process.exit(1);
}
if (typeof m.useWizard !== "function") {
  console.error("require() did not expose useWizard");
  process.exit(1);
}
console.log("require() ok: " + Object.keys(m).length + " exports");
EOF

if node cjs-check.cjs > cjs.log 2>&1; then
  pass "require() returns a usable module"
else
  fail "require() unusable"; sed -n '1,10p' cjs.log
fi

# ---------------------------------------------------------------- 4. SSR
section "4. Server-side render"

cat > ssr.cjs <<'EOF'
const React = require("react");
const { renderToString } = require("react-dom/server");
const pkg = require("react-form-wizard-component");
const FormWizard = pkg.default ?? pkg.FormWizard;
const { TabContent } = pkg;

const html = renderToString(
  React.createElement(
    FormWizard,
    { title: "Checkout", color: "#0e6f70" },
    React.createElement(TabContent, { title: "Cart" }, "cart-body"),
    React.createElement(TabContent, { title: "Pay" }, "pay-body")
  )
);

const checks = {
  "step titles": html.includes("Cart") && html.includes("Pay"),
  "panel body": html.includes("cart-body"),
  tablist: html.includes('role="tablist"'),
  tabpanel: html.includes('role="tabpanel"'),
  "live region": html.includes('aria-live="polite"'),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
if (failed.length) {
  console.error("missing from SSR output: " + failed.join(", "));
  process.exit(1);
}
console.log("react " + React.version + " rendered " + html.length + " chars");
EOF

if node ssr.cjs > ssr.log 2>&1; then
  pass "SSR renders tabs, panel and live region ($(cat ssr.log))"
else
  fail "SSR render failed"; sed -n '1,12p' ssr.log
fi

# ---------------------------------------------------------------- 5. shape
section "5. Package shape"

PKG=node_modules/react-form-wizard-component

if [ "$(node -p "Object.keys(require('$PWD/$PKG/package.json').dependencies||{}).length")" = "0" ]; then
  pass "zero runtime dependencies"
else
  fail "package declares runtime dependencies"
fi

if node -p "!!require('$PWD/$PKG/package.json').peerDependencies.react" | grep -q true; then
  pass "declares a react peer dependency"
else
  fail "no react peer dependency declared"
fi

if grep -qE "recentlyCreatedOwnerStacks|jsxDEV" "$PKG/dist/react-form-wizard-component.es.js"; then
  fail "React development runtime is inlined in the bundle"
else
  pass "no React internals inlined"
fi

for f in es.js cjs umd.js; do
  if head -c 400 "$PKG/dist/react-form-wizard-component.$f" | grep -q '"use client"'; then
    pass "\"use client\" present in $f"
  else
    fail "\"use client\" missing from $f"
  fi
done

for sub in styles.css dist/style.css dist/react-form-wizard-component.css; do
  if node -e "require.resolve('react-form-wizard-component/$sub')" 2>/dev/null; then
    pass "stylesheet subpath resolves: $sub"
  else
    fail "stylesheet subpath blocked: $sub"
  fi
done

for junk in dist/vite.svg dist/types/App.d.ts dist/types/setupTests.d.ts; do
  if [ -e "$PKG/$junk" ]; then
    fail "development file published: $junk"
  else
    pass "not published: $junk"
  fi
done

# ---------------------------------------------------------------- summary
section "Summary"
if [ "$FAILURES" -eq 0 ]; then
  printf '\033[32mAll consumer checks passed on React %s.\033[0m\n' "$REACT_VERSION"
  exit 0
fi
printf '\033[31m%s check(s) failed on React %s.\033[0m\n' "$FAILURES" "$REACT_VERSION"
exit 1
