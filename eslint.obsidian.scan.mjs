import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.*", "manifest.json"],
				},
				extraFileExtensions: [".json"],
			},
		},
	},

	...obsidianmd.configs.recommended,

	{
		files: ["**/*.{ts,cts,mts,tsx,js,cjs,mjs,jsx}"],
		rules: {
			"no-eval": "error",
			"no-implied-eval": "error",
			"no-unsanitized/method": "error",
			"no-unsanitized/property": "error",
			"obsidianmd/regex-lookbehind": "error",
			"obsidianmd/no-forbidden-elements": "error",

			"no-undef": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/restrict-template-expressions": "off",
			"@typescript-eslint/no-base-to-string": "off",
			"import/no-unresolved": "off",

			"obsidianmd/validate-manifest": "off",
			"obsidianmd/validate-license": "off",

			"obsidianmd/commands/no-command-in-command-id": "off",
			"obsidianmd/commands/no-plugin-id-in-command-id": "off",
		},
	},

	globalIgnores([
		"node_modules",
		"dist",
		"build",
		"pkg",
		"test-vault",
		".obsidian",
		"main.js",
		"**/.obsidian/**",
		"esbuild.config.mjs",
		"version-bump.mjs",
		"**/*.test.*",
		"**/*.tests.*",
		"**/*.spec.*",
		"**/*.specs.*",
		"**/test/**",
		"**/tests/**",
		"**/__tests__/**",
		"**/mocks/**",
		"**/__mocks__/**",
		"**/*.cjs",
		"**/*.mjs",
		"**/*.cts",
		"**/*.mts",
		"**/vite*",
		"**/scripts/**",
		"**/docs/**",
		"**/i18n/**",
		"**/i18next/**",
		"**/locale/**",
		"**/locales/**",
		"**/translations/**",
		"**/l10n/**",
		".pnpm-store",
		"**/*.spec.ts",
		"**/testUtils**",
		"automation/**",
		"e2e-tests/**",
	]),
]);
