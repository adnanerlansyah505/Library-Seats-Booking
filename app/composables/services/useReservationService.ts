import { useServiceApi } from '../useServiceApi'

export type Seat = {
	id: string
	label: string
	time: string
	date: string | null
	isAvailable: boolean
}

interface AvailableSeatsResponse {
	data: Seat[]
}

export const useReservationService = () => {
	const api = useServiceApi('reservations')

	return {
		fetchAvailableSeats: (bookingSlug: string, date?: string) =>
			api.get<AvailableSeatsResponse>('/available-seats', {
				params: { bookingSlug, date },
			}),
	}
}
