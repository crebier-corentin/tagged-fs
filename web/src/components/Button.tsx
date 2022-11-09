import { FaSolidSpinner } from "solid-icons/fa"
import { ComponentProps, JSX, mergeProps, splitProps } from "solid-js"

export type ButtonColor = "primary" | "neutral" | "danger" | "yellow"

const colorMap: Record<ButtonColor, string> = {
	primary: "indigo",
	neutral: "stone",
	danger: "red",
	yellow: "yellow",
}

type ButtonProps = ComponentProps<"button"> & {
	color: ButtonColor
	size?: "sm" | "md" | "lg"
	icon?: JSX.Element
	loading?: boolean
}
export function Button(props: ButtonProps): JSX.Element {
	const props_ = mergeProps({ size: "md", loading: false }, props)
	const [local, rest] = splitProps(props_, ["color", "icon", "size", "loading"])

	const classes = () => {
		let c = " font-medium text-white flex flex-row justify-center items-center"

		const color = colorMap[local.color]
		if (props.disabled != null && props.disabled) {
			c += ` bg-${color}-300`
		} else {
			c += ` bg-${color}-500 hover:bg-${color}-800 focus:bg-${color}-800`
		}

		const iconOnly = props.children == null
		if (iconOnly) {
			switch (local.size) {
				case "sm":
					c += " text-sm h-6 w-6"
					break
				case "md":
					c += " text-base h-8 w-8 py-1"
					break
				case "lg":
					c += " text-lg h-10 w-10 py-2"
					break
			}
		} else {
			switch (local.size) {
				case "sm":
					c += " text-sm h-6 px-2"
					break
				case "md":
					c += " text-sm h-8 px-4 py-1"
					break
				case "lg":
					c += " text-base h-10 px-4 py-1"
					break
			}
		}

		if (props.class != null) {
			c += " " + props.class
		}

		return c
	}

	return (
		<button {...rest} class={classes()}>
			{local.loading ? <FaSolidSpinner class="animate-spin" /> : local.icon != null && local.icon}

			{props.children != null && (local.loading || local.icon != null) && <>&nbsp;</>}

			{props.children}
		</button>
	)
}
