module.exports = {
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:solid/typescript",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
	plugins: ["@typescript-eslint", "solid"],
	root: true,
	rules: {
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/no-misused-promises": [
			"error",
			{
				checksVoidReturn: {
					arguments: false,
					attributes: false,
				},
			},
		],

		"solid/prefer-show": "off",
		"no-debugger": "warn",
	},
}
