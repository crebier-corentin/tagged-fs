import { FaSolidFile, FaSolidFloppyDisk, FaSolidFolder, FaSolidPen, FaSolidPlus, FaSolidTrash } from "solid-icons/fa"
import { createEffect, createResource, createSignal, For, JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { ApiFile, createFile, deleteFile, fileSrc, openFolder, pickFile, searchFiles, updateFile } from "./api"
import { useAppContext } from "./AppContext"
import { Button } from "./components/Button"
import { Confirm } from "./components/Confirm"
import { Col, Row } from "./components/Grid"
import { Input, LabelInput, LabelSelect } from "./components/Input"
import { Modal } from "./components/Modal"
import { Select } from "./components/Select"
import { Tag } from "./components/Tag"
import { Tooltip } from "./components/Tooltip"

const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

type FileModalProps = {
	file?: ApiFile
	open: boolean
	onClose: () => void
	refresh: () => Promise<void>
}
function FileModal(props: FileModalProps) {
	const [path, setPath] = createSignal("")
	const [tagIds, setTagIds] = createSignal([] as number[])

	const { tags } = useAppContext()

	const isValid = () => path().length > 0

	const save = async (): Promise<void> => {
		if (props.file != null) {
			await updateFile(props.file.id, { tags: tagIds() })
		} else {
			await createFile(path(), tagIds())
		}

		await props.refresh()
		props.onClose()
	}

	// reset forms on open
	createEffect(() => {
		if (!props.open) return

		if (props.file != null) {
			setPath(props.file.path)
			setTagIds(props.file.tags.map((t) => t.id))
		} else {
			setPath("")
			setTagIds([])
		}
	})

	return (
		<Modal
			open={props.open}
			onClose={() => props.onClose()}
			header={props.file ? "Edit File" : "New File"}
			footer={
				<>
					<div class="flex justify-end gap-x-1">
						<Tooltip content="Save">
							<Button color="primary" icon={<FaSolidFloppyDisk />} disabled={!isValid()} onClick={save} />
						</Tooltip>
					</div>
				</>
			}>
			<Row cols={2} gapX={2}>
				<Col span={1}>
					<LabelInput
						label="Path"
						type="text"
						readOnly
						value={path()}
						onClick={async () => {
							if (props.file != null) return // cannot modify existing file path

							setPath(await pickFile())
						}}
					/>
				</Col>
				<Col span={1}>
					<LabelSelect
						label="Tags"
						multiple
						value={tagIds()}
						onChange={setTagIds}
						options={tags().map((t) => ({
							key: t.id,
							label: (
								<Tag size="sm" color={t.color}>
									{t.name}
								</Tag>
							),
							search: t.name,
						}))}
						filterOption={(option, filter) => option.search.toLowerCase().includes(filter.toLowerCase())}
					/>
				</Col>
			</Row>
		</Modal>
	)
}

type ThumbnailProps = {
	file: ApiFile
}
function Thumbnail(props: ThumbnailProps): JSX.Element {
	return (
		<>
			{SUPPORTED_IMAGE_EXTENSIONS.some((ext) => props.file.path.endsWith(ext)) ? (
				<img class="object-contain w-8 h-8" src={fileSrc(props.file.id)} />
			) : (
				<span class="text-indigo-200">
					<FaSolidFile size={32} />
				</span>
			)}
		</>
	)
}

type FileItemProps = {
	file: ApiFile
	refresh: () => Promise<void>
	onEdit: () => void
}
function FileItem(props: FileItemProps): JSX.Element {
	const openFolder_ = async (): Promise<void> => {
		await openFolder(props.file.path)
	}
	const delete_ = async (): Promise<void> => {
		await deleteFile(props.file.id)

		await props.refresh()
	}

	return (
		<li class="grid grid-cols-[32px_1fr_2fr_1fr] p-2 even:bg-indigo-100">
			<Thumbnail file={props.file} />

			<span>{props.file.name}</span>

			<ul class="flex flex-row gap-x-1">
				<For each={props.file.tags}>
					{(tag) => (
						<li>
							<Tag color={tag.color}>{tag.name}</Tag>
						</li>
					)}
				</For>
			</ul>

			<div class="flex flex-row gap-x-2 justify-end">
				<Tooltip content="Open folder">
					<Button color="yellow" icon={<FaSolidFolder />} onClick={openFolder_} />
				</Tooltip>

				<Tooltip content="Edit file">
					<Button color="primary" icon={<FaSolidPen />} onClick={() => props.onEdit()} />
				</Tooltip>

				<Confirm content="Delete this file ?" onConfirm={delete_}>
					<Tooltip content="Delete">
						<Button color="danger" icon={<FaSolidTrash />} />
					</Tooltip>
				</Confirm>
			</div>
		</li>
	)
}

export function Files(): JSX.Element {
	const [modal, setModal] = createStore({ open: false, file: undefined as ApiFile | undefined })
	const [search, setSearch] = createSignal("")
	const [tagIds, setTagIds] = createSignal([] as number[])

	const { tags } = useAppContext()

	const [files, { refetch: refetchFiles }] = createResource(
		() => ({ search: search(), tagIds: tagIds() }),
		// eslint-disable-next-line solid/reactivity
		() => searchFiles(search(), tagIds()),
		{
			initialValue: [],
		}
	)

	return (
		<>
			<div class="grid grid-cols-[auto_1fr_1fr] items-center gap-x-1">
				<Tooltip content="Add new file">
					<Button
						color="primary"
						icon={<FaSolidPlus />}
						onClick={() => setModal({ open: true, file: undefined })}
					/>
				</Tooltip>

				<Input
					placeholder="Search by name"
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
				/>

				<Select
					placeholder="Search by tags"
					multiple
					value={tagIds()}
					onChange={setTagIds}
					options={tags().map((t) => ({
						key: t.id,
						label: (
							<Tag size="sm" color={t.color}>
								{t.name}
							</Tag>
						),
						search: t.name,
					}))}
					filterOption={(option, filter) => option.search.toLowerCase().includes(filter.toLowerCase())}
				/>
			</div>

			<Row cols={12} class="font-bold text-center">
				<Col span={4}>Name</Col>
				<Col span={6}>Tags</Col>
				<Col span={2}>Actions</Col>
			</Row>

			<ul>
				<For each={files()}>
					{(file) => (
						<FileItem
							file={file}
							refresh={refetchFiles as any}
							onEdit={() => setModal({ open: true, file })}
						/>
					)}
				</For>
			</ul>

			<FileModal
				open={modal.open}
				onClose={() => setModal({ open: false, file: undefined })}
				file={modal.file}
				refresh={refetchFiles as any}
			/>
		</>
	)
}
