import { ComponentProps, mergeProps, splitProps } from "solid-js"
import { JSX } from "solid-js/jsx-runtime"

function isLight(bgColor: string): boolean {
	const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor
	const r = parseInt(color.substring(0, 2), 16) // hexToR
	const g = parseInt(color.substring(2, 4), 16) // hexToG
	const b = parseInt(color.substring(4, 6), 16) // hexToB
	return r * 0.299 + g * 0.587 + b * 0.114 > 186
}

type TagProps = ComponentProps<"span"> & {
	color: string
	size?: "sm" | "md" | "lg"
}
export function Tag(props_: TagProps): JSX.Element {
	const props = mergeProps({ size: "md" }, props_)
	const [local, rest] = splitProps(props, ["color", "size"])

	const classes = () => {
		let c = "inline-block rounded-full font-semibold text-center"

		switch (local.size) {
			case "sm":
				c += " px-2 py-1 text-xs"
				break
			case "md":
				c += " px-3 py-1 text-sm"
				break
			case "lg":
				c += " px-4 py-2 text-base"
				break
		}

		if (rest.class != null) {
			c += " " + rest.class
		}

		return c
	}

	return (
		<span
			{...rest}
			style={{ "background-color": local.color, color: isLight(local.color) ? "#000000" : "#FFFFFF" }}
			class={classes()}
		/>
	)
}
