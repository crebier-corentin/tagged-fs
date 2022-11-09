import { FaSolidCircleExclamation, FaSolidCircleXmark } from "solid-icons/fa"
import { createEffect, createMemo, createSignal, For, JSX, mergeProps, onCleanup } from "solid-js"
import { Portal } from "solid-js/web"

export type Option<K extends string | number> = { key: K; label: JSX.Element }

type SelectBaseProps<K extends string | number, O extends Option<K>> = {
	id?: string
	class?: string
	placeholder?: string
	canClear?: boolean
	options: O[]
	filterOption: (option: O, filter: string) => boolean
}
type SelectSingleProps<K extends string | number, O extends Option<K>> = SelectBaseProps<K, O> & {
	multiple?: false

	value: K | null
	onChange: (value: K | null) => void
}
type SelectMultipleProps<K extends string | number, O extends Option<K>> = SelectBaseProps<K, O> & {
	multiple: true

	value: K[]
	onChange: (value: K[]) => void
}
export type SelectProps<K extends string | number, O extends Option<K>> =
	| SelectSingleProps<K, O>
	| SelectMultipleProps<K, O>
export function Select<K extends string | number, O extends Option<K>>(props: SelectProps<K, O>): JSX.Element {
	// @ts-ignore
	// eslint-disable-next-line solid/reactivity
	props = mergeProps({ canClear: true, multiple: false }, props) // default

	const [menuOpened, setMenuOpened] = createSignal(false)
	const [menuStyle, setMenuStyle] = createSignal({})
	const [search, setSearch] = createSignal("")

	const selectedItems = createMemo(() => {
		if (props.value === null) return []

		if (props.multiple) {
			return (
				props.options
					.filter((o) => (props.value as K[]).includes(o.key))
					// eslint-disable-next-line solid/reactivity
					.sort((a, b) => (props.value as K[]).indexOf(a.key) - (props.value as K[]).indexOf(b.key)) // sort by insertion
			)
		} else {
			return props.options.filter((o) => o.key === props.value)
		}
	})

	let selectRef: HTMLDivElement | undefined
	let menuRef: HTMLDivElement | undefined
	let searchRef: HTMLInputElement | undefined

	// Open and close menu
	createEffect(() => {
		const listener = (e: MouseEvent) => {
			setMenuOpened(!!(selectRef?.contains(e.target as Node) || menuRef?.contains(e.target as Node)))
		}
		document.body.addEventListener("click", listener)

		onCleanup(() => {
			document.body.removeEventListener("click", listener)
		})
	})

	// Animate menu opening/closing
	// Clear search when menu is closed
	createEffect(() => {
		const open = menuOpened() // call here to register the effect even if menuRef is null
		if (menuRef == null || selectRef == null) return

		menuRef.style.overflowY = "hidden"
		if (open) {
			// update menu position
			const { top, left, width, height } = selectRef.getBoundingClientRect()
			setMenuStyle({
				top: `${top + height}px`,
				left: `${left}px`,
				width: `${width}px`,
			})

			menuRef.style.height = "auto"
			menuRef.animate(
				[
					{ transform: "scaleY(0.8)", transformOrigin: "0% 0%", opacity: "0" },
					{ transform: "scaleY(1)", transformOrigin: "0% 0%", opacity: "1" },
				],
				{
					duration: 250,
				}
			)
		} else {
			const a = menuRef.animate(
				[
					{ transform: "scaleY(1)", transformOrigin: "0% 0%", opacity: "1" },
					{ transform: "scaleY(0.8)", transformOrigin: "0% 0%", opacity: "0" },
				],
				{
					duration: 250,
				}
			)
			a.addEventListener(
				"finish",
				() => {
					setSearch("")
					menuRef!.style.height = "0"
				},
				{ once: true }
			)
		}

		menuRef.style.removeProperty("overflowY")
	})

	const filteredOptions = createMemo(() => props.options.filter((o) => props.filterOption(o, search())))

	const selectOption = (option: O) => {
		// keep focus on search
		searchRef!.focus()

		if (props.multiple) {
			if (props.value.includes(option.key)) {
				props.onChange(props.value.filter((v) => v !== option.key))
			} else {
				props.onChange([...props.value, option.key])
			}
		} else {
			props.onChange(option.key)
		}
	}

	return (
		<>
			<div
				ref={selectRef}
				id={props.id}
				class={`relative py-2 px-3 min-h-[2rem] flex flex-row gap-1 items-center border border-indigo-400 hover:border-indigo-800 focus:border-indigo-800 ${
					props.class ?? ""
				}`}
				classList={{ "border-indigo-800": menuOpened() }}
				tabIndex="0"
				onClick={() => searchRef?.focus()}>
				{/* Placeholder doesn't work in fallback */}
				{!menuOpened() && selectedItems().length === 0 && props.placeholder != null && (
					<span class="whitespace-nowrap	text-indigo-300">{props.placeholder}</span>
				)}
				<For each={selectedItems()}>{(item) => item.label}</For>

				<input
					ref={searchRef}
					type="text"
					class="w-full border-transparent outline-0 flex-1"
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
				/>

				{selectedItems() != null && (
					<button
						title="Clear"
						class="absolute right-2 text-indigo-400 hover:text-indigo-800"
						onClick={() => {
							// @ts-expect-error
							props.onChange(props.multiple ? [] : null)
							setMenuOpened(false)
						}}>
						<FaSolidCircleXmark />
					</button>
				)}
			</div>

			<Portal>
				<div ref={menuRef} class="absolute h-0 bg-white shadow-xl z-50" style={menuStyle()}>
					<ul class="max-h-80 overflow-y-auto flex flex-col">
						<For
							each={filteredOptions()}
							fallback={
								<div class="h-12 text-indigo-400 flex justify-center items-center">
									<FaSolidCircleExclamation />
									&nbsp;No option
								</div>
							}>
							{(option) => {
								const isSelected = () => selectedItems().some((i) => i.key === option.key)
								return (
									<li
										class="p-2 w-full hover:bg-indigo-200"
										classList={{ "bg-indigo-300 font-semibold": isSelected() }}
										onClick={() => selectOption(option)}>
										{option.label}
									</li>
								)
							}}
						</For>
					</ul>
				</div>
			</Portal>
		</>
	)
}
