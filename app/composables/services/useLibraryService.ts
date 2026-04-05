import { useServiceApi } from '../useServiceApi'

export type Library = {
	id: number
	name: string
	description: string | null
	location: string | null
	ownerName: string | null
}

interface LibrariesResponse {
	data: Library[]
}

export const useLibraryService = () => {
	const api = useServiceApi('libraries')

	return {
		/** Fetch list of libraries (currently first 5 on the backend, but type is generic) */
		fetchLibraries: () => api.get<LibrariesResponse>('/', {}),
	}
}
