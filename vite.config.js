import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { bakedAttentionWeights } from './src/figures/figFormat.js'

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

// The drawing's one real row is ready in both copies' first paint. A's
// preview remains company-only; the full pass stays a lazy runtime chunk.
const facts = JSON.parse(readFileSync(new URL('./src/content/passFacts.json', import.meta.url), 'utf8'))
const layer = 0
const head = 0
const position = 6
const dims = manifest.tensors.find(
  (tensor) => tensor.name === `transformer.h.${layer}.attn.c_attn.weight_quantized`,
)?.dims
const weights = bakedAttentionWeights(facts.run, layer, head, position)
// ASSUMES: this drawing describes the saved eight-token sentence and a QKV
// wall with three equal thirds. Fail the build if that source contract moves.
if (facts.run.tokens.length !== 8 || facts.run.tokens[position] !== '␣down' ||
    dims?.length !== 2 || dims[1] !== dims[0] * 3 ||
    weights.some((weight) => !Number.isFinite(weight) || weight < 0 || weight > 1) ||
    Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - 1) > 0.00001 ||
    Math.abs(weights.reduce((sum, weight) => sum + Number(weight.toFixed(2)), 0) - 1) > 0.010001) {
  throw new Error('The three dies facts no longer match the drawing contract')
}

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
    __DIES_FACTS__: JSON.stringify({ tokens: facts.run.tokens, layer, head, position, weights, dims }),
    __BAKED_A__: JSON.stringify(process.env.VITE_COMPANY === '1' ? {
      sentence: facts.provenance.sentence,
      ids: facts.run.ids,
      tokens: facts.run.tokens,
      embeddings: facts.run.embeddings,
    } : null),
    __FILE_PARAMETERS__: JSON.stringify(manifest.parameters),
    __FILE_PROVENANCE__: JSON.stringify({
      sha256: provenance.sha256,
      bytes: provenance.bytes,
      readAt: provenance.readAt,
    }),
  },
}))
