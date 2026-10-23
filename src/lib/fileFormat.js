// How the page prints the model file's own facts, in one place: instrument E
// prints them in its head and its proof line, and section 07's file card
// prints the same three values and E's finding. One spelling of each, so the
// two can never disagree about what the same number looks like.

/** 83,502,375 bytes → `83.5 MB`. */
export const mb = (n) => `${(n / 1e6).toFixed(1)} MB`

/** 1d3ab4d7…8431 — enough of a hash to compare by eye. */
export const shortSha = (sha) => (sha ? `${sha.slice(0, 8)}…${sha.slice(-4)}` : '—')
