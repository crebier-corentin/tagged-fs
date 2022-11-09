import { FaSolidCow, FaSolidPlus } from "solid-icons/fa"
import { createSignal, JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { Button } from "./components/Button"
import { Col, ColProps, Row } from "./components/Grid"
import { LabelInput, LabelSelect } from "./components/Input"
import { Modal } from "./components/Modal"
import { Tabs } from "./components/Tabs"
import { Tag } from "./components/Tag"
import { Tooltip } from "./components/Tooltip"

function C(props: Partial<ColProps>) {
	const [aSpan, setASpan] = createSignal(1)

	return (
		<Col {...props} span={aSpan()} class={`p-2 bg-red-400 ${props.class ?? ""}`}>
			<input type="number" value={aSpan()} onInput={(e) => setASpan(e.currentTarget.valueAsNumber)} />
		</Col>
	)
}

export function Demo(): JSX.Element {
	const [c, setC] = createSignal("#000000")

	const [s, setS] = createSignal(null)
	const [sM, setSM] = createStore([] as any)

	const [modal, setModal] = createSignal(false)
	const [modal2, setModal2] = createSignal(false)

	const [cols, setCols] = createSignal(3)

	return (
		<>
			<Tabs
				items={[
					{ label: "Coucou", children: <strong>Bonjour</strong> },
					{ label: "Et oui", children: <strong>Et non</strong> },
					{ label: <h1 class="text-xl">Haha!</h1>, children: <h2>Yeah</h2> },
				]}
			/>

			<div class="container mx-auto">
				<LabelInput
					label="Columns"
					type="number"
					value={cols()}
					onInput={(e) => setCols(e.currentTarget.valueAsNumber)}
				/>

				<Row cols={cols()} gapX={4} gapY={2}>
					<C class="bg-red-400" />
					<C start={3} class="bg-blue-400" />
					<C class="bg-green-400" />
					<C class="bg-yellow-400" />
				</Row>

				<input type="color" value={c()} onInput={(e) => setC(e.currentTarget.value)} />

				<Tag color={c()} size="sm">
					Sm
				</Tag>
				<Tag color={c()}>Md</Tag>
				<Tag color={c()} size="lg">
					Lg
				</Tag>

				<LabelSelect
					label="Single"
					class="w-64"
					value={s()}
					onChange={setS}
					options={[
						{ key: 1, label: <Tag color="#FF0000">Red</Tag>, searchValue: "Red" },
						{ key: 2, label: <Tag color="#00FF00">Green</Tag>, searchValue: "Green" },
						{ key: 3, label: <Tag color="#0000FF">Blue</Tag>, searchValue: "Blue" },
					]}
					filterOption={(option, filter) => option.searchValue.toLowerCase().includes(filter.toLowerCase())}
				/>

				<LabelSelect
					multiple
					class="w-64"
					label="Multiple"
					value={sM}
					onChange={setSM}
					options={[
						{ key: 1, label: <Tag color="#FF0000">Red</Tag>, searchValue: "Red" },
						{ key: 2, label: <Tag color="#00FF00">Green</Tag>, searchValue: "Green" },
						{ key: 3, label: <Tag color="#0000FF">Blue</Tag>, searchValue: "Blue" },
					]}
					filterOption={(option, filter) => option.searchValue.toLowerCase().includes(filter.toLowerCase())}
				/>

				<div class="flex flex-row gap-1 m-3">
					<Tooltip content="Hello world aaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
						<Button color="primary" size="sm" loading>
							P
						</Button>
					</Tooltip>
					<Tooltip content={<strong>Coucou</strong>}>
						<Button color="danger" size="md">
							D
						</Button>
					</Tooltip>

					<Button color="primary" size="sm" icon={<FaSolidCow />} />
					<Button color="danger" icon={<FaSolidCow />} />
					<Button color="primary" size="lg" icon={<FaSolidCow />} />

					<Button color="primary" size="lg" disabled>
						P
					</Button>
					<Button color="danger" disabled>
						D
					</Button>

					<Button color="primary" icon={<FaSolidPlus />}>
						P
					</Button>
					<Button color="danger" icon={<FaSolidPlus />}>
						Lorem ipsum
					</Button>

					<Tooltip content="Hello world aaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
						<Button color="danger" icon={<FaSolidPlus />}>
							Lorem ipsum <strong>Haha</strong> Yeah
							<Button color="primary">aaa</Button>
							<p>
								<span>
									<b>A</b>
								</span>
							</p>
						</Button>
					</Tooltip>
				</div>

				<Button color="danger" onClick={() => setModal(true)}>
					Open modal
				</Button>
				<Modal open={modal()} onClose={() => setModal(false)} header={"Title"} footer={"Footer"}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec bibendum enim. Donec in lorem
					orci. Suspendisse ullamcorper tellus enim, eu sollicitudin dui elementum ac. Fusce elementum dolor
					in lectus interdum, non convallis lectus consectetur. Praesent semper libero condimentum ultrices
					faucibus. Etiam hendrerit feugiat nisl, vel sollicitudin ex blandit a. Duis eget laoreet ligula.
					Donec et vestibulum lorem, non porttitor mauris. Pellentesque habitant morbi tristique senectus et
					netus et malesuada fames ac turpis egestas. Cras imperdiet nisi nec ultricies sollicitudin. In
					hendrerit quis est ut feugiat.
					<Button color="primary" onClick={() => setModal2(true)}>
						Open modal 2
					</Button>
					<Modal open={modal2()} onClose={() => setModal2(false)}>
						<h1>Modal 2</h1>
					</Modal>
				</Modal>
			</div>
		</>
	)
}
