import { FaSolidArrowRight, FaSolidFloppyDisk, FaSolidPen, FaSolidPlus, FaSolidTrash } from "solid-icons/fa"
import { createEffect, createMemo, createSignal, For, JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { createTag, deleteTag, updateTag, updateTagsOrder } from "./api"
import { TagWithParent, useAppContext } from "./AppContext"
import { Button } from "./components/Button"
import { Confirm } from "./components/Confirm"
import { Col, Row } from "./components/Grid"
import { LabelInput, LabelSelect } from "./components/Input"
import { Modal } from "./components/Modal"
import { Tag } from "./components/Tag"
import { Tooltip } from "./components/Tooltip"
import {
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
	createSortable,
	closestCenter,
	DragEventHandler,
} from "@thisbeyond/solid-dnd"

type TagModalProps = {
	tags: TagWithParent[]

	tag?: TagWithParent
	open: boolean
	onClose: () => void
	refresh: () => Promise<void>
}
function TagModal(props: TagModalProps) {
	const [name, setName] = createSignal("")
	const [color, setColor] = createSignal("#000000")
	const [parentIds, setParentIds] = createSignal([] as number[])

	// remove tags that cause a circular reference
	const parentOptions = createMemo(() => {
		const circularIds = new Set([props.tag?.id])

		const isCircular = (tag: TagWithParent) => {
			if (circularIds.has(tag.id)) return true

			for (const parent of tag.parents) {
				if (isCircular(parent)) {
					circularIds.add(tag.id)
					return true
				}
			}

			return false
		}

		return props.tags.filter((tag) => !isCircular(tag))
	})

	const isValid = () => name().length > 0 && color().length > 0

	const delete_ = async (): Promise<void> => {
		if (props.tag == null) return

		await deleteTag(props.tag.id)

		await props.refresh()
		props.onClose()
	}

	const save = async (): Promise<void> => {
		if (props.tag != null) {
			await updateTag(props.tag.id, { name: name(), color: color(), parentIds: parentIds() })
		} else {
			await createTag(name(), color(), parentIds())
		}

		await props.refresh()
		props.onClose()
	}

	// reset forms on open
	createEffect(() => {
		if (!props.open) return

		if (props.tag != null) {
			setName(props.tag.name)
			setColor(props.tag.color)
			setParentIds(props.tag.parentIds)
		} else {
			setName("")
			setColor("")
			setParentIds([])
		}
	})

	return (
		<Modal
			open={props.open}
			onClose={() => props.onClose()}
			header={props.tag ? "Edit Tag" : "New Tag"}
			footer={
				<>
					<div class="flex justify-end gap-x-1">
						{props.tag != null && (
							<Confirm content="Delete this tag ?" onConfirm={delete_}>
								<Tooltip content="Delete">
									<Button color="danger" icon={<FaSolidTrash />} />
								</Tooltip>
							</Confirm>
						)}

						<Tooltip content="Save">
							<Button color="primary" icon={<FaSolidFloppyDisk />} disabled={!isValid()} onClick={save} />
						</Tooltip>
					</div>
				</>
			}>
			<Row cols={12} gapX={2}>
				<Col span={10}>
					<LabelInput
						label="Name"
						type="text"
						value={name()}
						onInput={(e) => setName(e.currentTarget.value)}
					/>
				</Col>
				<Col span={2}>
					<LabelInput
						label="Color"
						type="color"
						value={color()}
						onInput={(e) => setColor(e.currentTarget.value)}
					/>
				</Col>
				<Col span={12}>
					<LabelSelect
						label="Parent Tags"
						multiple
						value={parentIds()}
						onChange={setParentIds}
						options={parentOptions().map((t) => ({
							key: t.id,
							label: <Tag color={t.color}>{t.name}</Tag>,
							search: t.name,
						}))}
						filterOption={(option, filter) => option.search.toLowerCase().includes(filter.toLowerCase())}
					/>
				</Col>
			</Row>
		</Modal>
	)
}

type TagParentsProps = {
	tag: TagWithParent
}
function TagParents(props: TagParentsProps) {
	return (
		<ul class="grid grid-cols-[auto_1fr]">
			<For each={props.tag.parents}>
				{(parent) => (
					<li class="contents">
						<span class="flex flex-row items-center">
							<FaSolidArrowRight size={12} />
							<Tag class="my-1" size="sm" color={parent.color}>
								{parent.name}
							</Tag>
						</span>

						<span>{parent.parents.length > 0 && <TagParents tag={parent} />}</span>
					</li>
				)}
			</For>
		</ul>
	)
}

type TagItemProps = {
	tag: TagWithParent
	onClick: () => void
}
function TagItem(props: TagItemProps): JSX.Element {
	// eslint-disable-next-line solid/reactivity
	const sortable = createSortable(props.tag.id)

	return (
		<li
			use:sortable
			class="flex flex-col items-center p-1 min-w-[10ch] hover:bg-indigo-300 hover:cursor-pointer"
			classList={{ "opacity-25": sortable.isActiveDraggable }}>
			<span class="flex flex-row items-center gap-x-1">
				<Tag color={props.tag.color}>{props.tag.name}</Tag>

				{!sortable.isActiveDraggable && (
					<Tooltip content="Edit tag">
						<Button color="primary" size="sm" icon={<FaSolidPen />} onClick={() => props.onClick()} />
					</Tooltip>
				)}
			</span>

			{!sortable.isActiveDraggable && <TagParents tag={props.tag} />}
		</li>
	)
}

export function Tags(): JSX.Element {
	const [modal, setModal] = createStore({ open: false, tag: undefined as TagWithParent | undefined })
	const { tags, refreshTags } = useAppContext()

	// for drag and drop
	const [activeItem, setActiveItem] = createSignal<TagWithParent | null>(null)
	const ids = () => tags().map((t) => t.id)

	const onDragStart: DragEventHandler = ({ draggable }) => {
		const tag = tags().find((t) => t.id === draggable.id)!
		return setActiveItem(tag)
	}

	const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
		if (draggable && droppable) {
			const currentIds = ids()
			const fromIndex = currentIds.indexOf(draggable.id as number)
			const toIndex = currentIds.indexOf(droppable.id as number)
			if (fromIndex !== toIndex) {
				const updatedIds = currentIds.slice()
				updatedIds.splice(toIndex, 0, ...updatedIds.splice(fromIndex, 1))

				void updateTagsOrder(updatedIds).then(() => refreshTags())
			}
		}
		setActiveItem(null)
	}

	return (
		<>
			<span class="flex flex-row items-center">
				<Tooltip content="Add new tag">
					<Button
						color="primary"
						icon={<FaSolidPlus />}
						onClick={() => setModal({ open: true, tag: undefined })}
					/>
				</Tooltip>
				<p class="px-2 text-sm text-indigo-300">Drag to change order</p>
			</span>

			<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetector={closestCenter}>
				<DragDropSensors />
				<ul class="flex flex-wrap">
					<SortableProvider ids={ids()}>
						<For each={tags()}>
							{(tag) => <TagItem tag={tag} onClick={() => setModal({ open: true, tag })} />}
						</For>
					</SortableProvider>
				</ul>
				<DragOverlay>{activeItem() && <Tag color={activeItem()!.color}>{activeItem()!.name}</Tag>}</DragOverlay>
			</DragDropProvider>

			<TagModal
				tags={tags()}
				open={modal.open}
				onClose={() => setModal({ open: false, tag: undefined })}
				tag={modal.tag}
				refresh={refreshTags}
			/>
		</>
	)
}
