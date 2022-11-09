import { createContext, JSX, useContext, Accessor, createResource, createMemo } from "solid-js"
import { ApiTag, fetchAllTags } from "./api"

export type TagWithParent = ApiTag & { parents: TagWithParent[] }

export type AppContext = {
	tags: Accessor<TagWithParent[]>
	refreshTags: () => Promise<void>
}

const context = createContext<AppContext>()

export function AppContextProvider(props: { children: JSX.Element }): JSX.Element {
	const [tags, { refetch: refetchTags }] = createResource(fetchAllTags, { initialValue: [] })

	const tagsWithParent = createMemo(() => {
		const tagsCopy = tags().map((t) => ({ ...t, parents: [] })) as TagWithParent[]

		const tagsById = tagsCopy.reduce((obj, tag) => {
			obj[tag.id] = tag
			return obj
		}, {} as Record<number, TagWithParent>)

		for (const t of tagsCopy) {
			for (const parentId of t.parentIds) {
				t.parents.push(tagsById[parentId])
			}
		}

		return tagsCopy
	})

	return (
		<context.Provider
			value={{
				tags: tagsWithParent,
				refreshTags: refetchTags as unknown as () => Promise<void>,
			}}>
			{props.children}
		</context.Provider>
	)
}

export function useAppContext(): AppContext {
	return useContext(context)!
}
