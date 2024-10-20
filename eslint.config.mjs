import typescriptEslint from '@typescript-eslint/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [{
  ignores: [
    '**/node_modules',
    '**/target',
    '**/.idea',
    '**/.configit',
    '**/_snapshots_',
    '**/*.typegen.ts',
    '**/webpack.js',
  ],
}, ...compat.extends(
  'eslint:recommended',
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:@stylistic/recommended-extends',
), {
  plugins: {
    '@typescript-eslint': typescriptEslint,
    '@stylistic': stylistic,
  },

  languageOptions: {
    parser: tsParser,
  },
}]
