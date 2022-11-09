/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [],
	safelist: [
		{ pattern: /^grid-cols-.*/ },
		{ pattern: /^col-span-.*/ },
		{ pattern: /^col-start-.*/ },
		{ pattern: /^col-end-.*/ },
		{ pattern: /^gap-.*/ },

		{ pattern: /^justify-.*/ },
		{ pattern: /^justify-items-.*/ },
		{ pattern: /^content-.*/ },
		{ pattern: /^items-.*/ },
		{ pattern: /^justify-self-.*/ },
		{ pattern: /^self-.*/ },

		{ pattern: /^bg-(indigo|stone|red|yellow)-(300|500|800)/, variants: ["hover", "focus"] },
	],
}
