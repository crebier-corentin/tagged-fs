import axios from "axios"

let API_URL = "http://localhost:8080"
try {
	// try to get API url from Go
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	API_URL = await GET_API_URL()
} catch (e) {
	console.error(e)
}

export type ApiTag = {
	id: number
	name: string
	color: string
	parentIds: number[]
}

export type ApiFile = {
	id: number
	path: string
	name: string
	tags: ApiTag[]
}

export async function fetchAllTags(): Promise<ApiTag[]> {
	return (await axios.get<ApiTag[]>(`${API_URL}/tags`)).data
}
export async function createTag(name: string, color: string, parentIds: number[]): Promise<void> {
	await axios.post(`${API_URL}/tags`, { name, color, parentIds })
}
export async function updateTag(
	tagId: number,
	data: { name?: string; color?: string; parentIds?: number[] }
): Promise<void> {
	await axios.put(`${API_URL}/tags/${tagId}`, data)
}
export async function updateTagsOrder(ids: number[]): Promise<void> {
	await axios.put(`${API_URL}/tags/order`, ids)
}
export async function deleteTag(tagId: number): Promise<void> {
	await axios.delete(`${API_URL}/tags/${tagId}`)
}

export async function searchFiles(name: string, tagIds: number[]): Promise<ApiFile[]> {
	return (await axios.post<ApiFile[]>(`${API_URL}/files/search`, { name, tags: tagIds })).data
}
export async function createFile(path: string, tagIds: number[]): Promise<void> {
	await axios.post(`${API_URL}/files`, { path, tags: tagIds })
}
export async function updateFile(id: number, data: { tags?: number[] }): Promise<void> {
	await axios.put(`${API_URL}/files/${id}`, data)
}
export async function deleteFile(id: number): Promise<void> {
	await axios.delete(`${API_URL}/files/${id}`)
}

export async function openFolder(path: string): Promise<void> {
	await axios.post(`${API_URL}/open-folder`, { path })
}
export async function pickFile(): Promise<string> {
	return (await axios.post<string>(`${API_URL}/file-picker`)).data
}

export function fileSrc(id: number): string {
	return `${API_URL}/files/${id}/file`
}
