import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path is configurable for static hosting.
//
//   local dev / root-domain deploy : nothing to do, base stays '/'
//   GitHub Pages project site      : build with the repo name as the base, e.g.
//                                      VITE_BASE=/fixture-and-part/ npm run build
//                                    (leading AND trailing slash both required)
//   GitHub Pages user/org site     : base stays '/'
//
// https://vite.dev/config/

// The model file's fingerprint, size and reading date, as the build read them
// (src/content/fileFacts.json → provenance). Section 07's file card prints all
// three in its first paint. The JSON itself is a lazy chunk of 232 kB that
// instrument E fetches after the page is up; read from there, the card's
// paragraph would print without them for that moment and then reflow, which
// moves the page under a reader who reloads in section 07. Three fields, read
// here at build time, are in the first paint instead. Read once when the
// config loads: a dev server picks up a regenerated fileFacts.json on restart.
const { provenance } = JSON.parse(
  readFileSync(new URL('./src/content/fileFacts.json', import.meta.url), 'utf8'),
)

export default defineConfig(() => ({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  define: {
    __FILE_PROVENANCE__: JSON.stringify({
      sha256: provenance.sha256,
      bytes: provenance.bytes,
      readAt: provenance.readAt,
    }),
  },
}))
