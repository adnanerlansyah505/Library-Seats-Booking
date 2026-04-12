import { useServiceApi } from '../useServiceApi'

export type Seat = {
	id: string
	label: string
	time: string
	date: string | null
	isAvailable: boolean
	type: string
}

export interface AvailableSeatsResponse {
	data: Seat[]
	meta: {
		page: number
		pageSize: number
		total: number
		totalPages: number
	}
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired'

export interface ReservationItem {
	id: number
	libraryName: string
	libraryLocation: string | null
	seatCode: string | null
	seatLabel: string | null
	floor: number | null
	area: string | null
	reservedDate: string | null
	startTime: string | null
	endTime: string | null
	status: ReservationStatus
}

export const useReservationService = () => {
	const api = useServiceApi('reservations')

	return {
		fetchAvailableSeats: (bookingSlug: string, date?: string, page?: number) =>
			api.get<AvailableSeatsResponse>('/available-seats', {
				params: { bookingSlug, date, page },
			}),

		createReservation: (payload: { bookingSlug: string; seatSlug: string; date?: string }) =>
			api.post<{ data: { id: number } }>('/', {
				body: payload,
			}),

		fetchMyReservations: () =>
			api.get<{ data: ReservationItem[] }>('/', {}),

		cancelReservation: (id: number) =>
			api.patch<{ data: { id: number; status: ReservationStatus } }>(`/${id}`, {
				body: { action: 'cancel' },
			}),
	}
}
