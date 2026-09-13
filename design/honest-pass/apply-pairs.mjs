// node design/honest-pass/apply-pairs.mjs [--file <path>] [--dry]
// Applies every pair in pairs.mjs to src/content/essay.js (or --file). Each
// `old` must occur exactly once, or the run stops and changes nothing.
import { readFileSync, writeFileSync } from 'node:fs'
import { pairs } from './pairs.mjs'

const args = process.argv.slice(2)
const fileIx = args.indexOf('--file')
const file = fileIx >= 0 ? args[fileIx + 1] : 'src/content/essay.js'
const dry = args.includes('--dry')

let text = readFileSync(file, 'utf8')
const count = (hay, needle) => hay.split(needle).length - 1
let applied = 0
for (const p of pairs) {
  const n = count(text, p.old)
  if (n !== 1) {
    console.error(`STOP ${p.id}: old string occurs ${n} times (need exactly 1)`)
    process.exit(1)
  }
  text = text.replace(p.old, () => p.new)
  applied += 1
}
if (!dry) writeFileSync(file, text)
console.log(`OK ${applied} pairs ${dry ? 'would apply' : 'applied'} to ${file}`)
