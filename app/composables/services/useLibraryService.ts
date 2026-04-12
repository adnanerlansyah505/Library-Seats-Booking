import { useServiceApi } from '../useServiceApi'

export interface LibrarySummary {
	id: number
	slug: string | null
	name: string
	description: string | null
	location: string | null
	ownerName: string | null
	totalSeats: number
}

export interface LibrarySearchResponse {
	data: LibrarySummary[]
	meta: {
		page: number
		pageSize: number
		total: number
		totalPages: number
	}
}

// Alias used by stores/components
export type Library = LibrarySummary

export const useLibraryService = () => {
	const api = useServiceApi('libraries')

		const searchLibraries = (params: {
			q?: string
			date?: string
			time?: string
			seatType?: string
			page?: number
		}) =>
			api.get<LibrarySearchResponse>('/', {
				params,
			})

		// Simple wrapper used by the home page store to fetch a list of libraries
		// (defaults to the first page without filters).
		const fetchLibraries = () => searchLibraries({ page: 1 })

		return {
			searchLibraries,
			fetchLibraries,
		}
}

