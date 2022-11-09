import { children, createEffect, createMemo, createSignal, JSX, onCleanup } from "solid-js"
import { Portal } from "solid-js/web"

type TooltipProps = {
	content: JSX.Element
	children: JSX.Element
}
export function Tooltip(props: TooltipProps): JSX.Element {
	const [triggerHover, setTriggerHover] = createSignal(false)
	const [tooltipHover, setTooltipHover] = createSignal(false)
	const [show, setShow] = createSignal(false)
	const [domShow, setDomShow] = createSignal(false) // delayed for animation purposes

	const [tooltipStyle, setTooltipStyle] = createSignal({})

	let tooltipRef: HTMLDivElement | undefined

	const resolvedChildren = children(() => props.children)
	const trigger = createMemo(() => resolvedChildren.toArray()[0] as HTMLElement)

	// Set up the listeners to show the tooltip when the trigger is hovered
	createEffect(() => {
		const mouseEnter = () => setTriggerHover(true)
		const mouseLeave = () => setTriggerHover(false)

		trigger().addEventListener("mouseenter", mouseEnter)
		trigger().addEventListener("mouseleave", mouseLeave)

		onCleanup(() => {
			trigger().removeEventListener("mouseenter", mouseEnter)
			trigger().removeEventListener("mouseleave", mouseLeave)
		})
	})

	// Hide tooltip with a delay to allow to hover on it
	createEffect(() => {
		if (triggerHover() || tooltipHover()) {
			setShow(true)
		} else {
			const timeout = setTimeout(() => setShow(false), 100)
			onCleanup(() => clearTimeout(timeout))
		}
	})

	// Animate tooltip appearing/disappearing
	createEffect(() => {
		if (show()) {
			setDomShow(true)

			queueMicrotask(() => {
				tooltipRef!.animate(
					[
						{ transform: "scale(0.8)", opacity: "0" },
						{ transform: "scale(1)", opacity: "1" },
					],
					{ duration: 100 }
				)
			})
		} else {
			if (tooltipRef == null) return

			tooltipRef.animate(
				[
					{ transform: "scale(1)", opacity: "1" },
					{ transform: "scale(0.8)", opacity: "0" },
				],
				{ duration: 100 }
			).onfinish = () => {
				setDomShow(false)
			}
		}
	})

	// Update tooltip position when trigger position changes
	createEffect(() => {
		if (!domShow()) return // when hidden, tooltipRef is undefined

		const triggerRect = trigger().getBoundingClientRect()

		const tooltipRect = tooltipRef?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)

		let top = triggerRect.top - tooltipRect.height - 5
		let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2

		// clamp the tooltip to the viewport
		top = Math.max(0, top)
		left = Math.max(0, left)

		if (tooltipRect.height + top > window.innerHeight) {
			top = window.innerHeight - tooltipRect.height
		}
		if (tooltipRect.width + left > window.innerWidth) {
			left = window.innerWidth - tooltipRect.width
		}

		setTooltipStyle({
			top: `${top}px`,
			left: `${left}px`,
		})
	})

	return (
		<>
			{trigger}

			{domShow() && (
				<Portal>
					<div
						ref={tooltipRef}
						class="absolute p-1 text-sm bg-indigo-400 text-white shadow-sm shadow-indigo-400"
						style={tooltipStyle()}
						onMouseEnter={() => setTooltipHover(true)}
						onMouseLeave={() => setTooltipHover(false)}>
						{props.content}
					</div>
				</Portal>
			)}
		</>
	)
}
