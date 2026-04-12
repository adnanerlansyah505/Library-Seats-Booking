import { useServiceApi } from '../useServiceApi'

export interface LibrarySeatDetail {
	id: string
	code: string
	label: string
	type: string
	floor: number | null
	area: string | null
    openTime?: string
    closeTime?: string
	library: {
		id: number
		slug: string
		name: string
		description: string | null
		location: string | null
		ownerName: string | null
		image: string | null
	}
}

export const useLibrarySeatService = () => {
	const api = useServiceApi('libraries')

	return {
		fetchSeatDetail: (librarySlug: string, seatSlug: string) =>
			api.get<LibrarySeatDetail>(`/${librarySlug}/seats/${seatSlug}`),
	}
}
