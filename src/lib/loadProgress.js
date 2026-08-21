/**
 * The one wording of what the model download is doing, shared by the mode bar
 * in instrument A and the head affordances in B, C and D — the reader can see
 * two of them at once, and they must never disagree.
 */

const PHASE_TEXT = {
  files: 'fetching the tokenizer',
  model: 'downloading distilgpt2',
  session: 'preparing distilgpt2',
}

export function progressLabel(progress) {
  const percent = Math.max(0, Math.min(100, Math.round(progress?.percent || 0)))
  const phase = PHASE_TEXT[progress?.phase] ?? PHASE_TEXT.model
  return progress?.phase === 'model' && percent > 0
    ? `${phase} — ${percent}%`
    : phase
}
