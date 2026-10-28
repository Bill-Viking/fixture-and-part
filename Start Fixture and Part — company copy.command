#!/bin/zsh
# Double-click launcher — THE COMPANY COPY of The Fixture and the Part, on this Mac.
# The same page in the office dress: no model download anywhere; one real pass of the
# page's own sentence baked in. Lands on http://localhost:5174/ and opens it in your
# browser; starts the server first if needed. Close this window (or Ctrl+C) to stop it.
# The public copy has its own launcher beside this one, on port 5173.

export PATH="/opt/homebrew/bin:$PATH"
ROOT="/Users/bill/Projects/fixture-and-part"
# Until the company copy is merged, its code lives in this worktree; after the merge the
# folder is gone and the main checkout carries it.
[ -f "$ROOT/.claude/worktrees/company-look/src/lib/company.js" ] && ROOT="$ROOT/.claude/worktrees/company-look"
URL="http://localhost:5174/"
OPEN="--open"; [ -n "$FP_NO_OPEN" ] && OPEN=""

echo "THE FIXTURE AND THE PART · company copy · $URL"
command -v node >/dev/null || { echo "STOP · node is not installed · paste in Terminal:  brew install node"; exit 1; }
echo "1 of 3 · node $(node -v) · OK"
cd "$ROOT" || { echo "STOP · the project folder is missing: $ROOT"; exit 1; }
[ -f src/lib/company.js ] || { echo "STOP · this checkout has no company copy yet (src/lib/company.js is missing)"; exit 1; }
[ -d node_modules ] || [ -L node_modules ] || { echo "   · first run: installing the page's packages (one time)"; npm install --no-audit --no-fund || exit 1; }
echo "2 of 3 · serving from $ROOT ($(git rev-parse --short HEAD 2>/dev/null))"
if curl -s --max-time 1 "$URL" | grep -q "The Fixture and the Part"; then
  echo "3 of 3 · already running — opening $URL (you can close this window)"
  [ -n "$OPEN" ] && open "$URL"
else
  echo "3 of 3 · starting the server — the address bar should say localhost:5174"
  VITE_COMPANY=1 npm run dev -- $OPEN --port 5174 --strictPort --configLoader native
fi
