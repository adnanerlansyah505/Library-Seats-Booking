<template>
    <!-- Global alert for booking errors / success messages -->
    <Alert
        v-model="showAlert"
        :variant="alertVariant"
        position="top-right"
        :message="alertMessage"
    />

    <section class="min-h-[calc(100vh-96px)] flex flex-col">
        <!-- hero image -->
        <img src="~/assets/images/study-1.png" alt="Study Image" class="w-full h-auto" />

        <!-- main content + bottom-aligned button (no fixed positioning) -->
        <div class="p-4 flex-1 flex flex-col pb-30">
            <div class="mb-4" v-if="!isLoading && seat">
                <h2 class="text-xl font-bold mb-1">
                    {{ seat.library.name }} - {{ seat.label }}
                </h2>
                <p class="text-sm text-gray-500 mb-1" v-if="seat.library.location">
                    {{ seat.library.location }}
                </p>
                <p class="text-gray-700 mb-4 flex items-center gap-2">
                    <i class="ri-time-line text-lg"></i>
                    <span>
                        {{ seat.openTime }} - {{ seat.closeTime }}
                    </span>
                </p>
                <h2 class="text-xl font-bold mb-2">Seat Information</h2>
                <ul class="text-gray-700 space-y-1 text-sm">
                    <li><span class="font-semibold">Code:</span> {{ seat.code }}</li>
                    <li><span class="font-semibold">Type:</span> {{ seat.type }}</li>
                    <li v-if="seat.floor !== null"><span class="font-semibold">Floor:</span> {{ seat.floor }}</li>
                    <li v-if="seat.area"><span class="font-semibold">Area:</span> {{ seat.area }}</li>
                </ul>
                <div v-if="seat.library.description" class="mt-4">
                    <h2 class="text-xl font-bold mb-2">Library Description</h2>
                    <p class="text-gray-700 text-sm whitespace-pre-line">
                        {{ seat.library.description }}
                    </p>
                </div>
            </div>

            <div v-else-if="isLoading" class="flex-1 flex items-center justify-center">
                <p class="text-gray-500 text-sm">Loading seat details...</p>
            </div>

            <div v-else class="flex-1 flex items-center justify-center">
                <p class="text-gray-500 text-sm">Seat not found.</p>
            </div>

            <button
                class="btn btn-primary px-6 py-3 rounded-lg w-full mt-auto"
                :disabled="isLoading || isBooking || !seat"
                @click="handleConfirmBooking"
            >
                <span v-if="isBooking">Booking...</span>
                <span v-else>Confirm Booking</span>
            </button>
        </div>
    </section>

    <!-- Confirmation modal -->
    <Transition name="fade-up">
        <div
            v-if="isModalOpen"
            class="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
        >
            <div
                class="w-full h-full bg-white px-4 pt-4 pb-32 shadow-xl flex flex-col max-h-full"
            >
                <!-- Modal header -->
                <div class="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        class="w-10 h-10 p-2 rounded-full bg-gray-100 text-gray-700"
                        @click="closeModal"
                    >
                        <i class="ri-close-line text-xl"></i>
                    </button>
                    <h2 class="text-lg font-semibold">Confirmation</h2>
                    <span class="w-8" />
                </div>

                <!-- Modal body -->
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold mb-3">Booking Confirmed</h3>
                    <p class="text-gray-600 max-w-xs mx-auto">
                        Your seat at the Modern Library has been successfully booked.
                    </p>
                </div>

                <div class="flex flex-col flex-1">
                    <div class="space-y-2 mb-6 overflow-y-auto">
                        <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-200 text-primary flex items-center justify-center">
                                <i class="ri-map-pin-line text-xl text-gray-700"></i>
                            </div>
                            <div class="text-left">
                                <p class="text-sm text-gray-500">Location</p>
                                <p class="font-semibold text-gray-900">Modern Library</p>
                            </div>
                        </div>
    
                        <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-200 text-primary flex items-center justify-center">
                                <i class="ri-sofa-line text-xl text-gray-700"></i>
                            </div>
                            <div class="text-left">
                                <p class="text-sm text-gray-500">Seat</p>
                                <p class="font-semibold text-gray-900">Seat A1 · Study Area A</p>
                            </div>
                        </div>
    
                        <div class="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-200 text-primary flex items-center justify-center">
                                <i class="ri-time-line text-xl text-gray-700"></i>
                            </div>
                            <div class="text-left">
                                <p class="text-sm text-gray-500">Time</p>
                                <p class="font-semibold text-gray-900">10:00 AM - 12:00 PM</p>
                            </div>
                        </div>
                    </div>

                    <button
                        class="btn btn-primary w-full py-3 rounded-lg mt-auto"
                        :disabled="!reservationId"
                        @click="isModalReminderOpen = true"
                    >
                        Set Reminder
                    </button>
                    <button
                        type="button"
                        class="btn btn-white w-full py-3 rounded-lg mt-3"
                        @click="goToMyBookings"
                    >
                        Go to My Bookings
                    </button>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Reminder Modal -->
    <Transition name="fade-up">
        <div
            class="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
            v-if="isModalReminderOpen"
        >
            <div
                class="w-full h-full bg-white px-4 pt-4 pb-32 shadow-xl flex flex-col max-h-full"
            >
                <!-- Modal Header -->
                <div class="flex items-center justify-between mb-4">
                    <button 
                        type="button" 
                        class="w-10 h-10 p-2 rounded-full bg-gray-100 text-gray-700"
                        @click="isModalReminderOpen = false"
                    >
                        <i class="ri-close-line text-xl"></i>
                    </button>
                    <h2 class="text-lg font-semibold">Set Reminder</h2>
                    <!-- <h2 class="text-lg font-semibold">Reminder Set</h2> -->
                    <span class="w-8" />
                </div>

                <!-- Modal Body -->
                <div class="mb-6">
                    <div class="mb-8">
                        <!-- <div class="text-center grid place-items-center space-y-3">
                            <h3 class="text-2xl font-bold mb-3">Reminder Time Successfully</h3>
                            <p class="text-primary max-w-xs mx-auto">
                                You will receive a notification 15 minutes before your booking starts.
                            </p>
                            <NuxtLink to="/" class="btn btn-primary">Back to Home</NuxtLink>
                            <NuxtLink to="/my-bookings" class="flex items-center gap-2 text-primary">
                                <i class="ri-calendar-check-fill text-xl"></i>
                                <span class="font-medium">View all my bookings</span>
                            </NuxtLink>
                        </div> -->
                        <h3 class="text-2xl font-bold mb-3">Reminder Time</h3>
                        <div class="flex items-center gap-3 flex-wrap">
                            <button
                                type="button"
                                class="btn px-4 py-2 rounded-lg"
                                :class="selectedReminderOffset === 15 ? 'btn-primary text-white' : 'btn-white'"
                                @click="selectedReminderOffset = 15"
                            >
                                15 minutes before
                            </button>
                            <button
                                type="button"
                                class="btn px-4 py-2 rounded-lg"
                                :class="selectedReminderOffset === 30 ? 'btn-primary text-white' : 'btn-white'"
                                @click="selectedReminderOffset = 30"
                            >
                                30 minutes before
                            </button>
                            <button
                                type="button"
                                class="btn px-4 py-2 rounded-lg"
                                :class="selectedReminderOffset === 60 ? 'btn-primary text-white' : 'btn-white'"
                                @click="selectedReminderOffset = 60"
                            >
                                1 hour before
                            </button>
                            <button
                                type="button"
                                class="btn px-4 py-2 rounded-lg"
                                :class="selectedReminderOffset === 120 ? 'btn-primary text-white' : 'btn-white'"
                                @click="selectedReminderOffset = 120"
                            >
                                2 hours before
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold mb-3">Reminder Method</h3>
                        <div class="flex items-center gap-3 flex-wrap">
                            <button
                                type="button"
                                class="btn px-4 py-2 rounded-lg"
                                :class="selectedReminderMethod === 'email' ? 'btn-primary text-white' : 'btn-white'"
                                @click="selectedReminderMethod = 'email'"
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                class="btn btn-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
                                disabled
                            >
                                WhatsApp
                            </button>
                            <button
                                type="button"
                                class="btn btn-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
                                disabled
                            >
                                In-app Notification
                            </button>
                        </div>
                        <div class="mt-8">
                            <button
                                type="button"
                                class="btn btn-primary w-full py-3 rounded-lg"
                                :disabled="isReminderLoading || !reservationId"
                                @click="handleSetReminder"
                            >
                                <span v-if="isReminderLoading">Saving reminder...</span>
                                <span v-else>Confirm Reminder</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Alert from '~/components/Alerts/Alert.vue'
import { useLibrarySeatService, type LibrarySeatDetail } from '~/composables/services/useLibrarySeatService'
import { useReservationService } from '~/composables/services/useReservationService'
import { useReminderService } from '~/composables/services/useReminderService'

const route = useRoute()
const router = useRouter()
const isModalOpen = ref(false)
const isModalReminderOpen = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const seat = ref<LibrarySeatDetail | null>(null)
const isBooking = ref(false)
const isReminderLoading = ref(false)
const reservationId = ref<number | null>(null)
const selectedReminderOffset = ref<number>(15)
const selectedReminderMethod = ref<'email' | 'whatsapp' | 'in-app'>('email')
const showAlert = ref(false)
const alertMessage = ref('')
const alertVariant = ref<'success' | 'danger'>('danger')

const closeModal = () => {
    isModalOpen.value = false
}

const goToMyBookings = () => {
    isModalOpen.value = false
    isModalReminderOpen.value = false
    router.push('/my-bookings')
}

const fetchSeatDetail = async () => {
    const librarySlug = route.params.bookingSlug as string | undefined
    const seatSlug = route.params.seatSlug as string | undefined
    if (!librarySlug || !seatSlug) return

    const service = useLibrarySeatService()
    isLoading.value = true
    error.value = null

    try {
        seat.value = await service.fetchSeatDetail(librarySlug, seatSlug)
    }
    catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch seat detail:', e)
        error.value = e?.statusMessage || 'Failed to load seat detail.'
        seat.value = null
    }
    finally {
        isLoading.value = false
    }
}

const handleConfirmBooking = async () => {
    if (!seat.value || isBooking.value) return

    const bookingSlug = route.params.bookingSlug as string | undefined
    const seatSlug = route.params.seatSlug as string | undefined
    const date = route.query.date as string | undefined

    if (!bookingSlug || !seatSlug) return

    const reservationService = useReservationService()
    isBooking.value = true
    error.value = null

    try {
        const response = await reservationService.createReservation({
            bookingSlug,
            seatSlug,
            date,
        })
        reservationId.value = response.data.id
        isModalOpen.value = true
    }
    catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to create reservation:', e)
        // Show a clearer alert when the seat is already booked
        if (e?.statusCode === 409 || e?.response?.status === 409 || e?.statusMessage === 'Seat is already booked for this date') {
            alertMessage.value = 'This seat is already booked for the selected date. Please choose another seat or date.'
        }
        else {
            alertMessage.value = e?.statusMessage || 'Failed to create reservation.'
        }
        showAlert.value = true
        error.value = alertMessage.value
    }
    finally {
        isBooking.value = false
    }
}

const handleSetReminder = async () => {
    if (!reservationId.value || isReminderLoading.value) return

    const reminderService = useReminderService()
    isReminderLoading.value = true
    error.value = null

    try {
        await reminderService.createReminder(reservationId.value, selectedReminderOffset.value)
        // Close both modals after successfully creating a reminder
        isModalReminderOpen.value = false
        isModalOpen.value = false

        // Show a success alert informing the user how they will be notified
        const methodLabel =
            selectedReminderMethod.value === 'email'
                ? 'email'
                : selectedReminderMethod.value === 'whatsapp'
                    ? 'WhatsApp'
                    : 'in-app notification'

        alertVariant.value = 'success'
        alertMessage.value = `Reminder saved successfully. You will receive a notification via ${methodLabel} based on the reminder time you selected.`
        showAlert.value = true

        // After setting the reminder, redirect the user to their booking list
        router.push('/my-bookings')
    }
    catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to create reminder:', e)
        const message = e?.statusMessage || 'Failed to create reminder.'
        error.value = message

        alertVariant.value = 'danger'
        alertMessage.value = message
        showAlert.value = true
    }
    finally {
        isReminderLoading.value = false
    }
}

onMounted(() => {
    fetchSeatDetail()
})
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.fade-up-enter-from,
.fade-up-leave-to {
    opacity: 0;
    transform: translateY(16px);
}

.fade-up-enter-to,
.fade-up-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>