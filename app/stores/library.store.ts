import { defineStore } from 'pinia'
import { useLibraryService } from '~/composables/services/useLibraryService'
import type { Library } from '~/composables/services/useLibraryService'

export const useLibraryStore = defineStore('library', {
	state: () => ({
		libraries: [] as Library[],
		isLoading: false,
		error: null as string | null,
		isLoaded: false,
	}),

	getters: {
		topLibraries: (state): Library[] => state.libraries.slice(0, 5),
	},

	actions: {
		async fetchLibraries() {
			// Avoid refetching if we already have data
			if (this.isLoaded && this.libraries.length) return
			const libraryApi = useLibraryService()

			this.isLoading = true
			this.error = null

			try {
				const response = await libraryApi.fetchLibraries()

				this.libraries = response.data
				this.isLoaded = true
			}
			catch (error: any) {
				console.error('Failed to fetch libraries:', error)
				this.error = error?.statusMessage || 'Failed to load libraries.'
			}
			finally {
				this.isLoading = false
			}
		},
	},
})

