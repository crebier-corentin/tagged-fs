import { FaSolidTrash, FaSolidX } from "solid-icons/fa"
import { children, createEffect, createMemo, createSignal, JSX, onCleanup } from "solid-js"
import { Portal } from "solid-js/web"
import { Button } from "./Button"

type ConfirmProps = {
	content: JSX.Element
	children: JSX.Element
	onConfirm: () => void
}
export function Confirm(props: ConfirmProps): JSX.Element {
	const [show, setShow] = createSignal(false)
	const [domShow, setDomShow] = createSignal(false) // delayed for animation purposes

	const [popupStyle, setPopupStyle] = createSignal({})

	let popupRef: HTMLDivElement | undefined

	const resolvedChildren = children(() => props.children)
	const trigger = createMemo(() => resolvedChildren.toArray()[0] as HTMLElement)

	// Set up the listeners to show the popup when the trigger is clicked
	createEffect(() => {
		const listener = () => setShow(true)
		trigger().addEventListener("click", listener)

		onCleanup(() => {
			trigger().removeEventListener("click", listener)
		})
	})

	// Animate popup appearing/disappearing
	createEffect(() => {
		if (show()) {
			setDomShow(true)

			queueMicrotask(() => {
				popupRef!.animate(
					[
						{ transform: "scale(0.8)", opacity: "0" },
						{ transform: "scale(1)", opacity: "1" },
					],
					{ duration: 100 }
				)
			})
		} else {
			if (popupRef == null) return

			popupRef.animate(
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

	// Update popup position when trigger position changes
	createEffect(() => {
		if (!domShow()) return // when hidden, popupRef is undefined

		const triggerRect = trigger().getBoundingClientRect()

		const popupRect = popupRef?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0)

		let top = triggerRect.top - popupRect.height - 5
		let left = triggerRect.left + (triggerRect.width - popupRect.width) / 2

		// clamp the popup to the viewport
		top = Math.max(0, top)
		left = Math.max(0, left)

		setPopupStyle({
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
						ref={popupRef}
						class="absolute px-4 py-3 bg-white shadow-lg shadow-indigo-400"
						style={popupStyle()}>
						<div class="pt-1 pb-3">{props.content}</div>

						<div class="flex gap-x-2 justify-end">
							<Button color="neutral" size="sm" icon={<FaSolidX />} onClick={() => setShow(false)} />
							<Button
								color="danger"
								size="sm"
								icon={<FaSolidTrash />}
								onClick={() => {
									setShow(false)
									props.onConfirm()
								}}
							/>
						</div>
					</div>
				</Portal>
			)}
		</>
	)
}
