<template>
    <div class="p-4 space-y-8">
        <Alert
            v-model="showAlert"
            variant="danger"
            position="top-right"
            :message="alertMessage"
        />

        <div>
            <h3 class="text-lg font-semibold">Upcoming</h3>
            <div class="space-y-3 mt-4" v-if="upcomingReservations.length">
                <div
                    v-for="reservation in upcomingReservations"
                    :key="reservation.id"
                    class="flex items-center justify-between"
                >
                    <div class="flex items-center gap-3">
                        <i class="ri-book-open-line text-xl bg-blue-200 text-primary text-center w-10 h-10 p-2 rounded-lg"></i>
                        <div class="flex flex-col">
                            <h4 class="font-medium text-md line-clamp-2">
                                {{ formatReservationDateTime(reservation) }}
                            </h4>
                            <p class="text-gray-300">
                                {{ reservation.libraryName }}
                                <span v-if="reservation.floor !== null">
                                    - {{ reservation.floor }}{{ reservation.floor === 1 ? 'st' : 'th' }} Floor
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="btn btn-secondary px-4 rounded-lg"
                        :disabled="isCancelling && cancellingId === reservation.id"
                        @click="handleCancel(reservation)"
                    >
                        <span v-if="isCancelling && cancellingId === reservation.id">Cancelling...</span>
                        <span v-else>Cancel</span>
                    </button>
                </div>
            </div>
            <p v-else class="text-sm text-gray-500 mt-4">
                You have no upcoming bookings.
            </p>
        </div>

        <div>
            <h3 class="text-lg font-semibold">Past</h3>
            <div class="space-y-3 mt-4" v-if="pastReservations.length">
                <div
                    v-for="reservation in pastReservations"
                    :key="reservation.id"
                    class="flex items-center justify-between"
                >
                    <div class="flex items-center gap-3">
                        <i class="ri-book-open-line text-xl bg-blue-200 text-primary text-center w-10 h-10 p-2 rounded-lg"></i>
                        <div class="flex flex-col">
                            <h4 class="font-medium text-md line-clamp-2">
                                {{ formatReservationDateTime(reservation) }}
                            </h4>
                            <p class="text-gray-300">
                                {{ reservation.libraryName }}
                                <span v-if="reservation.floor !== null">
                                    - {{ reservation.floor }}{{ reservation.floor === 1 ? 'st' : 'th' }} Floor
                                </span>
                            </p>
                            <p class="text-xs text-gray-400">Status: {{ reservation.status }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <p v-else class="text-sm text-gray-500 mt-4">
                You have no past bookings yet.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import Alert from '~/components/Alerts/Alert.vue'
import { useReservationService, type ReservationItem } from '~/composables/services/useReservationService'

const reservations = ref<ReservationItem[]>([])
const isLoading = ref(false)
const isCancelling = ref(false)
const cancellingId = ref<number | null>(null)
const showAlert = ref(false)
const alertMessage = ref('')

const service = useReservationService()

const loadReservations = async () => {
    isLoading.value = true
    try {
        const response = await service.fetchMyReservations()
        reservations.value = response.data
    }
    catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to load reservations:', e)
        alertMessage.value = e?.statusMessage || 'Failed to load your bookings.'
        showAlert.value = true
    }
    finally {
        isLoading.value = false
    }
}

const isUpcoming = (reservation: ReservationItem): boolean => {
    const now = new Date()
    let end: Date | null = null

    if (reservation.endTime) {
        end = new Date(reservation.endTime)
    }
    else if (reservation.reservedDate) {
        end = new Date(`${reservation.reservedDate}T23:59:59`)
    }

    if (!end || Number.isNaN(end.getTime())) return false

    return end.getTime() >= now.getTime()
}

const upcomingReservations = computed(() =>
    reservations.value
        .filter(r => ['pending', 'confirmed'].includes(r.status))
        .filter(isUpcoming),
)

const pastReservations = computed(() =>
    reservations.value.filter(r => !isUpcoming(r) || ['cancelled', 'completed', 'expired'].includes(r.status)),
)

const formatReservationDateTime = (reservation: ReservationItem): string => {
    if (!reservation.reservedDate) return ''

    const [yearStr, monthStr, dayStr] = reservation.reservedDate.split('-')
    const year = Number.parseInt(yearStr ?? '', 10)
    const month = Number.parseInt(monthStr ?? '', 10)
    const day = Number.parseInt(dayStr ?? '', 10)

    if (!year || !month || !day) return reservation.reservedDate

    const date = new Date(year, month - 1, day)
    if (Number.isNaN(date.getTime())) return reservation.reservedDate

    const dateLabel = date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    if (reservation.startTime && reservation.endTime) {
        const start = new Date(reservation.startTime)
        const end = new Date(reservation.endTime)
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            const formatTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
            return `${dateLabel} · ${formatTime(start)} - ${formatTime(end)}`
        }
    }

    return dateLabel
}

const handleCancel = async (reservation: ReservationItem) => {
    if (isCancelling.value) return
    isCancelling.value = true
    cancellingId.value = reservation.id

    try {
        const response = await service.cancelReservation(reservation.id)
        const newStatus = response.data.status
        reservations.value = reservations.value.map(r =>
            r.id === reservation.id ? { ...r, status: newStatus } : r,
        )
    }
    catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to cancel reservation:', e)
        alertMessage.value = e?.statusMessage || 'Failed to cancel booking.'
        showAlert.value = true
    }
    finally {
        isCancelling.value = false
        cancellingId.value = null
    }
}

onMounted(() => {
    loadReservations()
})
</script>

<style lang="scss" scoped>

</style>