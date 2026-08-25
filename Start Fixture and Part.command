#!/bin/zsh
# Double-click launcher for The Fixture and the Part (local preview).
# Always lands on http://localhost:5173/ — starts the dev server first if needed.
# Close this Terminal window (or press Ctrl+C) to stop the server.

export PATH="/opt/homebrew/bin:$PATH"
cd "/Users/bill/Projects/fixture-and-part"

URL="http://localhost:5173/"

if curl -s --max-time 1 "$URL" | grep -q "The Fixture and the Part"; then
  echo "Already running — opening $URL"
  open "$URL"
  echo "You can close this window."
else
  echo "Starting The Fixture and the Part at $URL …"
  echo "(local preview — the address bar should say localhost:5173)"
  npm run dev -- --open --port 5173 --strictPort
fi
