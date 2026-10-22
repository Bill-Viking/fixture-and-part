#!/usr/bin/env node
// Reads the harness that built this page, and writes down how big it is.
//
// Section 10's SPECIMEN — THE HARNESS says that the models which wrote this
// page remember nothing between sittings, and that what carries is written
// down: a status file, an opener, a memory folder, the repository's history.
// The readout under it prints those things measured. This script is where the
// measuring happens — at build time, from the repository it runs in — so no
// number on the readout is typed. It writes src/content/harnessFacts.json, and
// src/figures/HarnessReadout.jsx draws the readout from it.
//
//   readAt              the UTC day of the reading, dated the way
//                       fileFacts.json dates its own
//   modelBytes          the model file's size, from fileFacts.json's provenance
//   status              STATUS.md: its bytes, and its lines as `wc -l` counts
//                       them (newline characters)
//   opener              OPENER.md: its bytes
//   memory              the app's memory folder for this project: how many
//                       *.md files it holds and their total size in KB — the
//                       page's own KB, 1,000 bytes, as instrument F prints
//                       it — or null when the folder is not there
//   commits             the repository's commits: all of them (`git rev-list
//                       --count HEAD`), and those made on the read day and on
//                       the day before it, midnight to midnight in this
//                       machine's local time (`git log --since --until`)
//   carriedInsideModel  0. Nothing a sitting does writes the model file: the
//                       page reads it, the harness never opens it, and its
//                       sha256 is checked against fileFacts.json wherever it
//                       is read.
//
// A row this script cannot read is written as null — never as a guess — and
// the readout prints "not read at build" in its place.
//
// The page is public, so the JSON holds dates, counts and sizes and nothing
// else: no path, no file name out of the memory folder, no user name.
//
// The memory folder lives outside the repository. HARNESS_MEMORY_DIR names it
// when set. Otherwise it is ~/.claude/projects/<slug>/memory, where <slug> is
// the project's path with every character that is not a letter or a digit
// turned into '-' — the app's own rule, under which '/' becomes '-'. The path
// is the working directory, which `npm run` sets to the project root; in a
// linked git worktree the app files the memory under the main checkout's
// path, so that path is tried after it.
//
// Usage:
//
//   npm run facts:harness
//   node scripts/read-harness.mjs
//   HARNESS_MEMORY_DIR=<folder> node scripts/read-harness.mjs

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT = 'src/content/harnessFacts.json'

const say = (line) => process.stderr.write(`${line}\n`)

/** git, in this repository; throws when git cannot answer. */
const git = (...args) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()

/** A file in the repository: its bytes, and its newlines if asked. Null when it is not there. */
function fileFacts(name, { lines = false } = {}) {
  let bytes
  try {
    bytes = readFileSync(join(ROOT, name))
  } catch {
    say(`  ${name}: not read`)
    return null
  }
  if (!lines) return { bytes: bytes.length }
  let count = 0
  for (const byte of bytes) if (byte === 0x0a) count++
  return { bytes: bytes.length, lines: count }
}

/** The model file's size, as read-model-file.mjs recorded it. */
function modelBytes() {
  try {
    const facts = JSON.parse(readFileSync(join(ROOT, 'src/content/fileFacts.json'), 'utf8'))
    const bytes = facts?.provenance?.bytes
    return Number.isInteger(bytes) ? bytes : null
  } catch {
    say('  src/content/fileFacts.json: not read')
    return null
  }
}

/** The app's rule for naming a project's folder: anything not a letter or a digit becomes '-'. */
const slugOf = (path) => path.replace(/[^A-Za-z0-9]/g, '-')

/** Where the memory folder may be, in the order tried, each with how it was found. */
function memoryCandidates() {
  if (process.env.HARNESS_MEMORY_DIR) {
    return [{ dir: process.env.HARNESS_MEMORY_DIR, how: 'HARNESS_MEMORY_DIR' }]
  }
  const paths = [{ path: process.cwd(), how: 'the working directory' }]
  try {
    const common = git('rev-parse', '--path-format=absolute', '--git-common-dir')
    paths.push({ path: dirname(common), how: 'the main checkout' })
  } catch {
    // Not a git checkout: the working directory is the only path there is.
  }
  const seen = new Set()
  return paths
    .filter(({ path }) => !seen.has(path) && seen.add(path))
    .map(({ path, how }) => ({ dir: join(homedir(), '.claude', 'projects', slugOf(path), 'memory'), how }))
}

/** The memory folder: how many *.md files, and their total size in KB. Null when absent. */
function memory() {
  for (const { dir, how } of memoryCandidates()) {
    let names
    try {
      names = readdirSync(dir)
    } catch {
      continue
    }
    let files = 0
    let bytes = 0
    for (const name of names) {
      if (!name.endsWith('.md')) continue
      const stat = statSync(join(dir, name))
      if (!stat.isFile()) continue
      files++
      bytes += stat.size
    }
    say(`  memory folder found by ${how}: ${files} files, ${bytes} bytes`)
    return { files, kb: Math.round(bytes / 1000) }
  }
  say('  memory folder: not found — written as null')
  return null
}

/** A calendar day, moved by whole days. */
function dayFrom(iso, delta) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

/** Commits made on one calendar day, midnight to midnight in this machine's local time. */
function commitsOn(iso) {
  const out = git('log', `--since=${iso} 00:00:00`, `--until=${dayFrom(iso, 1)} 00:00:00`, '--format=%H')
  return out ? out.split('\n').length : 0
}

function commits(readAt) {
  try {
    return {
      total: Number(git('rev-list', '--count', 'HEAD')),
      dayBefore: commitsOn(dayFrom(readAt, -1)),
      day: commitsOn(readAt),
    }
  } catch {
    say('  git: not read')
    return null
  }
}

function main() {
  const now = new Date()
  const readAt = now.toISOString().slice(0, 10)
  const local = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((n, i) => String(n).padStart(i === 0 ? 4 : 2, '0'))
    .join('-')
  if (local !== readAt) {
    // The reading is dated by the UTC day and the commits are counted on that
    // same calendar day in local time; when the two days differ, say so.
    say(`  note: the local day is ${local} and the UTC day is ${readAt}; commits are counted on ${readAt}, local time`)
  }

  const facts = {
    readAt,
    modelBytes: modelBytes(),
    status: fileFacts('STATUS.md', { lines: true }),
    opener: fileFacts('OPENER.md'),
    memory: memory(),
    commits: commits(readAt),
    carriedInsideModel: 0,
  }

  const json = `${JSON.stringify(facts, null, 2)}\n`
  writeFileSync(join(ROOT, OUT), json)
  say(`wrote ${OUT}`)
  say(json.trimEnd())
}

main()
