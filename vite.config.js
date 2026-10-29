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
const { provenance, manifest } = JSON.parse(
  readFileSync(new URL('./src/content/fileFacts.json', import.meta.url), 'utf8'),
)

// The company entry loads these faces after its local dress, under one deadline.
// Keep the preconnects and leave the consumer HTML entirely untouched.
const companyFonts = {
  name: 'company-nonblocking-fonts',
  apply: 'build',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const pageFonts = /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="https:\/\/fonts\.googleapis\.com\/css2\?family=Space\+Grotesk[^"]*")[^>]*>/g
      if (html.match(pageFonts)?.length !== 1) {
        throw new Error('Expected exactly one page-font stylesheet in index.html')
      }
      return html.replace(pageFonts, '')
    },
  },
}

export default defineConfig(() => ({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), ...(process.env.VITE_COMPANY === '1' ? [companyFonts] : [])],
  define: {
    __FILE_PARAMETERS__: JSON.stringify(manifest.parameters),
    __FILE_PROVENANCE__: JSON.stringify({
      sha256: provenance.sha256,
      bytes: provenance.bytes,
      readAt: provenance.readAt,
    }),
  },
}))
