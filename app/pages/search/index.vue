<template>
    <div class="p-4 pb-24 space-y-6">
        <!-- Search input -->
        <SearchInput v-model="query" @submit="handleSearchSubmit" />

        <!-- Filters -->
        <section>
            <h3 class="text-lg font-semibold mb-3">Filters</h3>
            <SearchFilters
                v-model:date="selectedDate"
                v-model:time="selectedTime"
                v-model:seatType="selectedSeatType"
                :date-options="dateOptions"
                :time-options="timeOptions"
                :seat-type-options="seatTypeOptions"
            />
        </section>

        <!-- Results -->
        <section>
            <h3 class="text-lg font-semibold">Results</h3>
            <div class="space-y-3 mt-4">
                <div
                    v-for="item in seats"
                    :key="`${item.library.slug}-${item.id}`"
                    class="flex items-center justify-between cursor-pointer"
                    @click="goToBooking(item)"
                >
                    <div class="flex items-center gap-3">
                        <i class="ri-book-open-line text-xl bg-blue-200 text-primary text-center w-10 h-10 p-2 rounded-lg"></i>
                        <div class="flex flex-col">
                            <h4 class="font-medium text-md line-clamp-2">
                                {{ item.label }}
                            </h4>
                            <p class="text-gray-400 text-sm">
                                {{ item.library.name }}
                                <span v-if="item.library.location"> · {{ item.library.location }}</span>
                            </p>
                            <p v-if="item.time" class="text-gray-400 text-xs">
                                {{ item.time }}
                            </p>
                        </div>
                    </div>
                </div>

                <p
                    v-if="!isLoading && !seats.length"
                    class="text-sm text-gray-500 mt-4"
                >
                    No libraries found. Try adjusting your search or filters.
                </p>

                <div v-if="isLoading" class="text-sm text-gray-500 mt-4">
                    Loading libraries...
                </div>

                <!-- Infinite scroll sentinel -->
                <div
                    v-if="hasMore"
                    ref="loadMoreTrigger"
                    class="h-4"
                ></div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import SearchInput from '~/components/Search/SearchInput.vue'
import SearchFilters from '~/components/Search/SearchFilters.vue'
import { useSeatSearchService, type SeatSearchItem } from '~/composables/services/useSeatSearchService'

const query = ref('')

const selectedDate = ref<string | undefined>()
const selectedTime = ref<string | undefined>()
const selectedSeatType = ref<string | undefined>()

const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
]

const timeOptions = [
    { value: 'any', label: 'Any Time' },
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
]

const seatTypeOptions = [
    { value: 'any', label: 'Any Seat' },
    { value: 'individual', label: 'Individual' },
    { value: 'group', label: 'Group' },
]

const seats = ref<SeatSearchItem[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const hasMore = ref(true)

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const seatSearchService = useSeatSearchService()
const router = useRouter()

const formatDateToYMD = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

const mapDateFilterToIso = () => {
    const value = selectedDate.value
    if (!value || value === 'this-week') return undefined

    const today = new Date()

    if (value === 'today') {
        return formatDateToYMD(today)
    }

    if (value === 'tomorrow') {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return formatDateToYMD(tomorrow)
    }

    // If the value is already a concrete date string, just pass it through
    return value
}

const toApiFilters = () => {
    return {
        date: mapDateFilterToIso(),
        time: selectedTime.value,
        seatType: selectedSeatType.value,
    }
}

const fetchSeats = async (page = 1, append = false) => {
    isLoading.value = true
    try {
        const response = await seatSearchService.searchSeats({
            q: query.value || undefined,
            page,
            ...toApiFilters(),
        })

        if (append) {
            seats.value = [...seats.value, ...response.data]
        }
        else {
            seats.value = response.data
        }

        currentPage.value = response.meta.page
        totalPages.value = response.meta.totalPages
        hasMore.value = currentPage.value < totalPages.value
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load libraries:', e)
    }
    finally {
    isLoading.value = false
    }
}

const handleSearchSubmit = () => {
    // Reset to first page and refetch when the user submits search
    fetchSeats(1, false)
}

const goToBooking = (item: SeatSearchItem) => {
    if (!item.library.slug) return

    const queryParams: Record<string, string> = {}
    const mappedDate = mapDateFilterToIso()

    if (mappedDate) {
        queryParams.date = mappedDate
    }

    if (selectedSeatType.value && selectedSeatType.value !== 'any') {
        queryParams.type = selectedSeatType.value
    }

    router.push({
        path: `/bookings/${item.library.slug}/seats/${item.id}`,
        query: queryParams,
    })
}

onMounted(() => {
    // Initial load
    fetchSeats(1, false)

    // Setup intersection observer for lazy loading
    if (import.meta.client) {
        observer = new IntersectionObserver((entries) => {
            const entry = entries[0]
            if (entry && entry.isIntersecting && hasMore.value && !isLoading.value) {
                fetchSeats(currentPage.value + 1, true)
            }
        })

        watch(
            () => loadMoreTrigger.value,
            (el) => {
                if (!observer) return
                if (el) observer.observe(el)
            },
            { immediate: true },
        )
    }

    // Refetch when filters change
    watch([selectedDate, selectedTime, selectedSeatType], () => {
        fetchSeats(1, false)
    })
})

onBeforeUnmount(() => {
    if (observer) {
        observer.disconnect()
        observer = null
    }
})
</script>

<style scoped lang="scss">

</style>