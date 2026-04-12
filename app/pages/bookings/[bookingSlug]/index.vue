<template>
    <div class="px-4 pt-4 pb-32 space-y-6">
        <!-- Individual / Group toggle (static for now) -->
        <div class="grid grid-cols-2 items-center gap-2 bg-gray-300 rounded-lg max-w-sm mx-auto p-1">
            <button
                type="button"
                class="px-4 rounded-lg font-medium transition-colors"
                :class="selectedSeatType === 'individual' ? 'btn btn-white' : 'text-gray-700'
                "
                @click="selectedSeatType = 'individual'"
            >
                Individual
            </button>
            <button
                type="button"
                class="px-4 rounded-lg font-medium transition-colors"
                :class="selectedSeatType === 'group' ? 'btn btn-white' : 'text-gray-700'"
                @click="selectedSeatType = 'group'"
            >
                Group
            </button>
        </div>

        <!-- Date selector -->
        <section class="mt-2">
            <button
                class="w-full flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800"
                @click="isDatePickerOpen = true"
            >
                <i class="ri-calendar-line text-lg"></i>
                <span>{{ selectedDateLabel }}</span>
            </button>
        </section>

        <section class="mt-4">
            <h2 class="text-xl font-semibold mb-3">Available Seats</h2>
            <div class="flex items-center gap-2 mb-5">
                <span class="grow bg-green-200 text-center px-4 py-8 rounded-lg text-green-600 font-semibold">
                    {{ availableCount }} Available
                </span>
                <span class="grow bg-red-200 text-center px-4 py-8 rounded-lg text-red-600 font-semibold">
                    {{ occupiedCount }} Occupied
                </span>
            </div>
            <div class="flex flex-col space-y-5" v-if="filteredSeats.length">
                <div
                    v-for="seat in filteredSeats"
                    :key="seat.id"
                    class="flex items-center justify-between"
                >
                    <div class="flex items-center gap-3">
                        <i class="ri-sofa-fill text-2xl py-2 px-3 bg-blue-200 text-primary rounded-lg"></i>
                        <div>
                            <h3 class="text-lg font-semibold">{{ seat.label }}</h3>
                            <p class="text-sm text-gray-600">{{ seat.time }}</p>
                        </div>
                    </div>
                    <NuxtLink
                        :to="{
                            path: `/bookings/${bookingSlug}/seats/${seat.id.toLowerCase()}`,
                            query: selectedDate ? { date: selectedDate } : {},
                        }"
                        class="px-3 py-2 rounded-lg btn btn-secondary"
                    >
                        Book Now
                    </NuxtLink>
                </div>

                <!-- Infinite scroll sentinel -->
                <div
                    v-if="reservationStore.hasMore"
                    ref="loadMoreTrigger"
                    class="h-4"
                ></div>
            </div>
            <p v-else class="text-sm text-gray-500 text-center mt-6">
                No seats available for this date.
            </p>
        </section>

        <!-- Date picker modal -->
        <BookingDatePickerModal
            v-model="isDatePickerOpen"
            v-model:selected-date="selectedDate"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import BookingDatePickerModal from '~/components/Booking/DatePickerModal.vue'
import { useReservationStore } from '~/stores/reservation.store'
import type { Seat } from '~/composables/services/useReservationService'

const route = useRoute()
const reservationStore = useReservationStore()
const { seats, isLoading } = storeToRefs(reservationStore)

const isDatePickerOpen = ref(false)
const selectedDate = ref<string | null>(null)
const selectedSeatType = ref<'individual' | 'group'>('individual')

// Infinite scroll state
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const bookingSlug = computed(() => route.params.bookingSlug as string)

const selectedDateLabel = computed(() => {
    if (!selectedDate.value) return 'Select date'
    // selectedDate is in yyyy-mm-dd (local) format; construct a Date in local time
    const [yearStr, monthStr, dayStr] = selectedDate.value.split('-')
    const year = Number.parseInt(yearStr ?? '', 10)
    const month = Number.parseInt(monthStr ?? '', 10)
    const day = Number.parseInt(dayStr ?? '', 10)

    if (!year || !month || !day) return selectedDate.value

    const d = new Date(year, month - 1, day)
    if (Number.isNaN(d.getTime())) return selectedDate.value

    return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
})

const filteredSeats = computed<Seat[]>(() => {
    const byType = seats.value.filter((seat: Seat) => seat.type === selectedSeatType.value)

    if (!selectedDate.value) return byType

    return byType.filter((seat: Seat) => seat.date === selectedDate.value)
})

const availableCount = computed(
    () => filteredSeats.value.filter((seat: Seat) => seat.isAvailable).length,
)

const occupiedCount = computed(
    () => filteredSeats.value.filter((seat: Seat) => !seat.isAvailable).length,
)

// Initial fetch when page loads
onMounted(() => {
    if (bookingSlug.value) {
        reservationStore.fetchSeats(bookingSlug.value)
    }

    // Setup intersection observer for lazy loading
    if (import.meta.client) {
        observer = new IntersectionObserver((entries) => {
            const entry = entries[0]
            if (entry && entry.isIntersecting && reservationStore.hasMore && !isLoading.value && bookingSlug.value) {
                reservationStore.fetchSeats(
                    bookingSlug.value,
                    selectedDate.value || undefined,
                    reservationStore.currentPage + 1,
                    true,
                )
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
})

// Refetch when date changes
watch(selectedDate, (newDate) => {
    if (bookingSlug.value) {
        reservationStore.fetchSeats(bookingSlug.value, newDate || undefined, 1, false)
    }
})

onBeforeUnmount(() => {
    if (observer) {
        observer.disconnect()
        observer = null
    }
})
</script>

<style lang="scss" scoped>

</style>