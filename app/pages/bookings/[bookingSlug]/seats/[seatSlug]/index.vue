<template>
    <section class="min-h-[calc(100vh-96px)] flex flex-col">
        <!-- hero image -->
        <img src="~/assets/images/study-1.png" alt="Study Image" class="w-full h-auto" />

        <!-- main content + bottom-aligned button (no fixed positioning) -->
        <div class="container p-4 flex-1 flex flex-col pb-30">
            <div class="mb-4">
                <h2 class="text-xl font-bold mb-2">Modern Library - Seat A1</h2>
                <p class="text-gray-700 mb-4">Monday, July 15 · 10:00 AM - 12:00 PM</p>
                <h2 class="text-xl font-bold mb-4">Description</h2>
                <p class="text-gray-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Amet, voluptate. Doloribus, quisquam. Amet, voluptate. Doloribus, quisquam. Amet, voluptate. Doloribus, quisquam. Amet, voluptate. Doloribus.
                </p>
            </div>
            <button
                class="btn btn-primary px-6 py-3 rounded-lg w-full mt-auto"
                @click="isModalOpen = true"
            >
                Confirm Booking
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
    
                    <button class="btn btn-primary w-full py-3 rounded-lg mt-auto" @click="isModalReminderOpen = true">
                        Set Reminder
                    </button>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Reminder Modal -->
    <Transition name="fade-up">
        <div
            class="fixed inset-0 z-20 flex items-center justify-center bg-black/40"
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
                            <button type="button" class="btn btn-white px-4 py-2 rounded-lg">
                                15 minutes before
                            </button>
                            <button type="button" class="btn btn-white px-4 py-2 rounded-lg">
                                30 minutes before
                            </button>
                            <button type="button" class="btn btn-white px-4 py-2 rounded-lg">
                                1 hour before
                            </button>
                            <button type="button" class="btn btn-white px-4 py-2 rounded-lg">
                                2 hours before
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold mb-3">Reminder Method</h3>
                        <div class="flex items-center gap-3 flex-wrap">
                            <button type="button" class="btn btn-white px-4 py-2 rounded-lg">
                                Email
                            </button>
                            <button type="button" class="btn btn-white px-4 py-2 rounded-lg">
                                WhatsApp
                            </button>
                            <button type="button" class="btn btn-white px-4 py-2 rounded-lg">
                                In-app Notification
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const isModalOpen = ref(false);
const isModalReminderOpen = ref(false);

const closeModal = () => {
    isModalOpen.value = false
}
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