export const COMPANY = import.meta.env.VITE_COMPANY === '1'

// Keep the build-time branches beside the flag so Vite can discard the
// inactive runtime and stylesheet imports before it discovers their chunks.
export const loadTransformers = COMPANY ? undefined : () => import('@huggingface/transformers')
export const loadCompanyStyle = COMPANY ? () => import('../company.css') : undefined
