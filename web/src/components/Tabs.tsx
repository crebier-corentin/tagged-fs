import { createEffect, createSignal, For, JSX } from "solid-js"

export type TabItem = {
	label: JSX.Element
	children: JSX.Element
}

type TabsProps = {
	items: TabItem[]
}
export function Tabs(props: TabsProps): JSX.Element {
	const [activeIndex, setActiveIndex] = createSignal(0)

	const [borderStyle, setBorderStyle] = createSignal({})

	const tabRefs = [] as HTMLDivElement[]
	createEffect(() => {
		const tabRef = tabRefs[activeIndex()]
		if (!tabRef) return

		setBorderStyle({
			left: `${tabRef.offsetLeft}px`,
			width: `${tabRef.offsetWidth}px`,
		})
	})

	return (
		<div class="flex flex-col">
			<nav class="relative flex flex-row border-b-2 border-indigo-300">
				<For each={props.items}>
					{(item, i) => (
						<div
							class="p-4 ml-8 first:ml-0 cursor-pointer hover:text-indigo-500"
							ref={tabRefs[i()]}
							onClick={() => setActiveIndex(i())}>
							{item.label}
						</div>
					)}
				</For>

				<div
					class="absolute bottom-[-2px] h-1 bg-indigo-800 transition-all duration-300"
					style={borderStyle()}
				/>
			</nav>
			{props.items[activeIndex()].children}
		</div>
	)
}
