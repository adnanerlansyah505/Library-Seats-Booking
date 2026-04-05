<template>
    <div class="px-4 pt-4 pb-32 space-y-6">
        <!-- Individual / Group toggle (static for now) -->
        <div class="grid grid-cols-2 items-center gap-2 bg-gray-300 rounded-lg max-w-sm mx-auto p-1">
            <button type="button" class="btn btn-white px-4 rounded-lg font-medium">
                Individual
            </button>
            <button type="button" class="px-4 font-medium">
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
                        :to="`/bookings/modern-library/seats/${seat.id.toLowerCase()}`"
                        class="px-3 py-2 rounded-lg btn btn-secondary"
                    >
                        Book Now
                    </NuxtLink>
                </div>
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
import BookingDatePickerModal from '~/components/Booking/DatePickerModal.vue'

type Seat = {
    id: string
    label: string
    time: string
    date: string // ISO yyyy-mm-dd
    isAvailable: boolean
}

const allSeats: Seat[] = [
    {
        id: 'A1',
        label: 'Seat A1',
        time: '10:00 AM - 12:00 PM',
        date: '2024-10-10',
        isAvailable: true,
    },
    {
        id: 'A2',
        label: 'Seat A2',
        time: '12:00 PM - 2:00 PM',
        date: '2024-10-10',
        isAvailable: false,
    },
    {
        id: 'B1',
        label: 'Seat B1',
        time: '2:00 PM - 4:00 PM',
        date: '2024-10-11',
        isAvailable: true,
    },
    {
        id: 'B2',
        label: 'Seat B2',
        time: '4:00 PM - 6:00 PM',
        date: '2024-10-11',
        isAvailable: false,
    },
]

const isDatePickerOpen = ref(false)
const selectedDate = ref<string | null>(null)

const selectedDateLabel = computed(() => {
    if (!selectedDate.value) return 'Select date'
    const d = new Date(selectedDate.value)
    if (Number.isNaN(d.getTime())) return selectedDate.value
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
})

const filteredSeats = computed(() => {
    if (!selectedDate.value) return allSeats
    return allSeats.filter((seat) => seat.date === selectedDate.value)
})

const availableCount = computed(
    () => filteredSeats.value.filter((seat) => seat.isAvailable).length,
)

const occupiedCount = computed(
    () => filteredSeats.value.filter((seat) => !seat.isAvailable).length,
)
</script>

<style lang="scss" scoped>

</style>