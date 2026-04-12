import { defineStore } from 'pinia'
import { useReservationService, type Seat } from '~/composables/services/useReservationService'

export const useReservationStore = defineStore('reservation', {
	state: () => ({
		seats: [] as Seat[],
		isLoading: false,
		error: null as string | null,
		currentPage: 1,
		totalPages: 0,
		hasMore: true,
	}),

	getters: {
		availableSeats: (state): Seat[] => state.seats.filter(seat => seat.isAvailable),
		occupiedSeats: (state): Seat[] => state.seats.filter(seat => !seat.isAvailable),
	},

	actions: {
		async fetchSeats(bookingSlug: string, date?: string, page = 1, append = false) {
			const service = useReservationService()

			if (!append) {
				this.isLoading = true
			}
			this.error = null

			try {
				const response = await service.fetchAvailableSeats(bookingSlug, date, page)

				if (append) {
					this.seats = [...this.seats, ...response.data]
				}
				else {
					this.seats = response.data
				}

				this.currentPage = response.meta.page
				this.totalPages = response.meta.totalPages
				this.hasMore = this.currentPage < this.totalPages
			}
			catch (error: any) {
				console.error('Failed to fetch seats:', error)
				this.error = error?.statusMessage || 'Failed to load seats.'
				if (!append) {
					this.seats = []
				}
				this.hasMore = false
			}
			finally {
				this.isLoading = false
			}
		},
	},
})
