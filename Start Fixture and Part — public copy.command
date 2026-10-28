#!/bin/zsh
# Double-click launcher — THE PUBLIC COPY of The Fixture and the Part, on this Mac.
# The full page: the model download door, live mode, everything. Lands on
# http://localhost:5173/ and opens it in your browser; starts the server first if needed.
# Close this Terminal window (or press Ctrl+C) to stop the server.
# The company copy has its own launcher beside this one, on port 5174.

export PATH="/opt/homebrew/bin:$PATH"
ROOT="/Users/bill/Projects/fixture-and-part"
URL="http://localhost:5173/"
OPEN="--open"; [ -n "$FP_NO_OPEN" ] && OPEN=""

echo "THE FIXTURE AND THE PART · public copy · $URL"
command -v node >/dev/null || { echo "STOP · node is not installed · paste in Terminal:  brew install node"; exit 1; }
echo "1 of 3 · node $(node -v) · OK"
cd "$ROOT" || { echo "STOP · the project folder is missing: $ROOT"; exit 1; }
[ -d node_modules ] || { echo "   · first run: installing the page's packages (one time)"; npm install --no-audit --no-fund || exit 1; }
echo "2 of 3 · serving from $ROOT ($(git rev-parse --short HEAD 2>/dev/null))"
if curl -s --max-time 1 "$URL" | grep -q "The Fixture and the Part"; then
  echo "3 of 3 · already running — opening $URL (you can close this window)"
  [ -n "$OPEN" ] && open "$URL"
else
  echo "3 of 3 · starting the server — the address bar should say localhost:5173"
  npm run dev -- $OPEN --port 5173 --strictPort --configLoader native
fi
