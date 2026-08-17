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
export default defineConfig(() => ({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
}))
