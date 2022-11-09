import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { viteSingleFile } from "vite-plugin-singlefile"
import devtools from "solid-devtools/vite"
import eslint from "vite-plugin-eslint"

export default defineConfig({
	plugins: [
		eslint({ failOnError: false }),
		devtools({
			jsxLocation: true,
			name: true,
		}),
		solidPlugin(),
		viteSingleFile(),
	],
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
		emptyOutDir: false,
	},
	// needed for solid-dnd
	optimizeDeps: {
		extensions: ["jsx"],
	},
})
