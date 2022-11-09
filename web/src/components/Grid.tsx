import { ComponentProps, JSX, ValidComponent } from "solid-js"
import { Dynamic } from "solid-js/web"

export type RowProps<T extends ValidComponent = "div", P = ComponentProps<T>> = {
	[K in keyof P]: P[K]
} & {
	component?: T
	cols: number
	gapX?: number
	gapY?: number

	justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly"
	justifyItems?: "start" | "center" | "end" | "stretch"
	alignContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | "baseline"
	alignItems?: "start" | "center" | "end" | "stretch" | "baseline"
}
export function Row<T extends ValidComponent = "div">(props: RowProps<T>): JSX.Element {
	const computedProps = () => {
		const {
			class: class_,
			cols,
			gapX,
			gapY,
			justifyContent,
			justifyItems,
			alignContent,
			alignItems,
			...rest
		} = props
		const classes = ["grid", `grid-cols-${cols}`]

		if (justifyContent != null) classes.push(`justify-${justifyContent}`)
		if (justifyItems != null) classes.push(`justify-items-${justifyItems}`)
		if (alignContent != null) classes.push(`content-${alignContent}`)
		if (alignItems != null) classes.push(`items-${alignItems}`)
		if (gapX != null) classes.push(`gap-x-${gapX}`)
		if (gapY != null) classes.push(`gap-y-${gapY}`)

		if (class_ != null) classes.push(class_)

		return { component: "div", class: classes.join(" "), ...rest }
	}

	return <Dynamic {...computedProps()} />
}

export type ColProps<T extends ValidComponent = "div", P = ComponentProps<T>> = {
	[K in keyof P]: P[K]
} & {
	component?: T
	span: number
	start?: number
	end?: number

	justifySelf?: "auto" | "start" | "center" | "end" | "stretch"
	alignSelf?: "auto" | "start" | "center" | "end" | "stretch" | "baseline"
}
export function Col<T extends ValidComponent = "div">(props: ColProps<T>): JSX.Element {
	const computedProps = () => {
		const { class: class_, span, start, end, justifySelf, alignSelf, ...rest } = props

		const classes = [`col-span-${span}`]

		if (start != null) classes.push(`col-start-${start}`)
		if (end != null) classes.push(`col-end-${end}`)

		if (justifySelf != null) classes.push(`justify-self-${justifySelf}`)
		if (alignSelf != null) classes.push(`self-${alignSelf}`)

		if (class_ != null) classes.push(class_)

		return { component: "div", class: classes.join(" "), ...rest }
	}

	return <Dynamic {...computedProps()} />
}
