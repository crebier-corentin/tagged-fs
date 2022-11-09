import { JSX } from "solid-js"
import { AppContextProvider } from "./AppContext"
import { Tabs } from "./components/Tabs"
import { Files } from "./Files"
import { Tags } from "./Tags"

export function App(): JSX.Element {
	return (
		<AppContextProvider>
			<Tabs
				items={[
					{
						label: "Files",
						children: <Files />,
					},
					{
						label: "Tags",
						children: <Tags />,
					},
				]}
			/>
		</AppContextProvider>
	)
}
