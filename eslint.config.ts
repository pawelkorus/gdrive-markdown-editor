import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';


export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylistic,
  {
    ignores: [
      '**/node_modules',
      '**/target',
      '**/.idea',
      '**/.configit',
      '**/_snapshots_',
      '**/*.typegen.ts',
      '**/webpack.js',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-empty-function': 'off'
    }
  },
  {
    // disable `any` checks in tests
    files: ["test/**/*.ts", "test/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  }
);

// export default [{
//   ignores: [
//     '**/node_modules',
//     '**/target',
//     '**/.idea',
//     '**/.configit',
//     '**/_snapshots_',
//     '**/*.typegen.ts',
//     '**/webpack.js',
//   ],
// }, ...compat.extends(
//   'eslint:recommended',
//   'plugin:@typescript-eslint/eslint-recommended',
//   'plugin:@typescript-eslint/recommended',
//   'plugin:@stylistic/recommended-extends',
// ), {
//   plugins: {
//     '@typescript-eslint': typescriptEslint,
//     '@stylistic': stylistic,
//   },

//   languageOptions: {
//     parser: tsParser,
//   },

//   settings: {
//     'import/resolver': {
//       alias: {
//         map: [
//           ['@app', './src'],
//         ],
//         extensions: ['.ts', '.js', '.jsx', '.json'],
//       },
//     },
//   },
// }]
