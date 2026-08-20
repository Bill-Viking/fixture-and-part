#!/bin/zsh
# Double-click launcher for The Fixture and the Part (dev server).
# Starts Vite and opens the site in the default browser.
# Close this Terminal window (or press Ctrl+C) to stop the server.

export PATH="/opt/homebrew/bin:$PATH"
cd "/Users/bill/Projects/fixture-and-part"

echo "Starting The Fixture and the Part…"
npm run dev -- --open
