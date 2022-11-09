import { FaSolidCircleXmark } from "solid-icons/fa"
import { createEffect, createSignal, JSX, onCleanup, Show } from "solid-js"
import { Portal } from "solid-js/web"

// Handle nested modals
let modalCount = 0
function openModal(): number {
	modalCount++

	if (modalCount === 1) {
		document.body.style.overflowY = "hidden"
	}

	return modalCount
}
function closeModal() {
	modalCount--

	if (modalCount === 0) {
		document.body.style.removeProperty("overflow-y")
	}
}

type ModalProps = {
	open: boolean
	onClose: () => void

	header?: JSX.Element
	children: JSX.Element
	footer?: JSX.Element
}
export function Modal(props: ModalProps): JSX.Element {
	const [showPortal, setShowPortal] = createSignal(false) // delay portal creation to play animation

	let modalId = -1

	let backdropRef: HTMLDivElement | undefined
	let modalRef: HTMLDivElement | undefined

	// open and close animation
	createEffect(() => {
		if (props.open) {
			modalId = openModal()

			// run animations
			setShowPortal(true)
			queueMicrotask(() => {
				const height = modalRef!.scrollHeight / 2 + 5

				backdropRef!.animate(
					[
						{ opacity: 0, easing: "ease-out" },
						{ opacity: 0.5, easing: "ease-in" },
					],
					{ duration: 500 }
				)
				modalRef!.animate(
					[
						{ top: `${-height}px`, easing: "ease-out" },
						{ top: "50%", easing: "ease-in" },
					],
					{ duration: 500 }
				)
			})

			onCleanup(() => {
				closeModal()
				modalId = -1

				const height = modalRef!.scrollHeight / 2 + 5

				// run animations
				const backdropAnimation = backdropRef!.animate(
					[
						{ opacity: 0.5, easing: "ease-out" },
						{ opacity: 0, easing: "ease-in" },
					],
					{ duration: 500 }
				)
				const modalAnimation = modalRef!.animate(
					[
						{ top: "50%", easing: "ease-out" },
						{ top: `${-height}px`, easing: "ease-in" },
					],
					{ duration: 500 }
				)

				const backdropPromise = new Promise((resolve) => (backdropAnimation.onfinish = resolve))
				const modalPromise = new Promise((resolve) => (modalAnimation.onfinish = resolve))

				void Promise.all([backdropPromise, modalPromise]).then(() => {
					setShowPortal(false)
				})
			})
		}
	})

	// close modal on escape key
	createEffect(() => {
		if (!props.open) return

		const listener = (e: KeyboardEvent) => {
			if (modalCount != modalId) return // only close modal if focused

			if (e.code === "Escape") {
				props.onClose()
			}
		}
		window.addEventListener("keydown", listener)

		onCleanup(() => {
			window.removeEventListener("keydown", listener)
		})
	})

	return (
		<Show when={showPortal()}>
			<Portal>
				<div ref={backdropRef} class="fixed top-0 left-0 h-full w-full bg-black opacity-50" />

				<div
					ref={modalRef}
					class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[520px] bg-white shadow-indigo-100 shadow-lg">
					<div class="relative">
						<button
							class="absolute top-0 right-0 w-16 h-16 flex justify-center items-center text-2xl text-red-400 hover:text-red-600"
							title="Close"
							onClick={() => props.onClose()}>
							<FaSolidCircleXmark />
						</button>

						<div class="divide-y">
							{props.header && <header class="px-6 py-4 text-2xl">{props.header}</header>}
							<article class="p-6" classList={{ "pt-12": props.header == null }}>
								{props.children}
							</article>
							{props.footer && <footer class="px-4 py-2">{props.footer}</footer>}
						</div>
					</div>
				</div>
			</Portal>
		</Show>
	)
}
