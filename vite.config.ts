import { defineConfig } from 'vite'

import RhythmMeister from './lib'
import fontPresets from './rhythmmeister.json' assert { type: 'json' }

export default defineConfig({
  css: {
    postcss: {
      plugins: [RhythmMeister(fontPresets)],
    },
  },
})
