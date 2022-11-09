import { ComponentProps, createUniqueId, JSX } from "solid-js"
import { Option, Select, SelectProps } from "./Select"

type InputProps = ComponentProps<"input">
export function Input(props: InputProps): JSX.Element {
	return (
		<input
			{...props}
			class={`block py-2 px-3 min-h-[42px] w-full border border-indigo-400 hover:border-indigo-800 focus:border-indigo-800 outline-0 placeholder:text-indigo-300 ${
				props.class ?? ""
			}`}
		/>
	)
}

type LabelProps = ComponentProps<"label">
export function Label(props: LabelProps): JSX.Element {
	return <label {...props} class={`mb-2 text-indigo-400 ${props.class ?? ""}`} />
}

type FormGroupProps = ComponentProps<"div">
export function FormGroup(props: FormGroupProps): JSX.Element {
	return <div {...props} class={`mb-2 ${props.class ?? ""}`} />
}

type LabelInputProps = InputProps & {
	label: string
}
export function LabelInput(props: LabelInputProps): JSX.Element {
	const id = createUniqueId()

	return (
		<FormGroup>
			<Label for={id}>{props.label}</Label>
			<Input id={id} placeholder={props.label} {...props} />
		</FormGroup>
	)
}

type LabelSelectProps<K extends string | number, O extends Option<K>> = SelectProps<K, O> & {
	label: string
}
export function LabelSelect<K extends string | number, O extends Option<K>>(
	props: LabelSelectProps<K, O>
): JSX.Element {
	const id = createUniqueId()

	return (
		<FormGroup>
			<Label for={id}>{props.label}</Label>
			<Select id={id} placeholder={props.label} {...props} />
		</FormGroup>
	)
}
