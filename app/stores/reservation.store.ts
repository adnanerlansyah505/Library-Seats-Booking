import { defineStore } from 'pinia'
import { useReservationService, type Seat } from '~/composables/services/useReservationService'

export const useReservationStore = defineStore('reservation', {
	state: () => ({
		seats: [] as Seat[],
		isLoading: false,
		error: null as string | null,
	}),

	getters: {
		availableSeats: (state): Seat[] => state.seats.filter(seat => seat.isAvailable),
		occupiedSeats: (state): Seat[] => state.seats.filter(seat => !seat.isAvailable),
	},

	actions: {
		async fetchSeats(bookingSlug: string, date?: string) {
			const service = useReservationService()

			this.isLoading = true
			this.error = null

			try {
				const response = await service.fetchAvailableSeats(bookingSlug, date)
				this.seats = response.data
			}
			catch (error: any) {
				console.error('Failed to fetch seats:', error)
				this.error = error?.statusMessage || 'Failed to load seats.'
				this.seats = []
			}
			finally {
				this.isLoading = false
			}
		},
	},
})
