<template>
    <div class="container px-4 pt-4 pb-32">
        <div class="grid grid-cols-2 items-center gap-2 bg-gray-300 rounded-lg max-w-sm mx-auto p-1">
            <button type="button" class="btn btn-white px-4 rounded-lg font-medium">
                Individual
            </button>
            <button type="button" class="px-4 font-medium">
                Group
            </button>
        </div>
        <div class="mt-6">
            <h2 class="text-xl font-semibold mb-3">Available Seats</h2>
            <div class="flex items-center gap-2 mb-5">
                <span class="grow bg-green-200 text-center px-4 py-8 rounded-lg text-green-600 font-semibold">
                    4 Available
                </span>
                <span class="grow bg-red-200 text-center px-4 py-8 rounded-lg text-red-600 font-semibold">
                    4 Occupied
                </span>
            </div>
            <div class="flex flex-col space-y-5">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="ri-sofa-fill text-2xl py-2 px-3 bg-blue-200 text-primary rounded-lg"></i>
                        <div>
                            <h3 class="text-lg font-semibold">Seat A1</h3>
                            <p class="text-sm text-gray-600">10:00 AM - 12:00 PM</p>
                        </div>
                    </div>
                    <NuxtLink to="/bookings/modern-librart/seats/a1" class="px-3 py-2 rounded-lg btn btn-secondary">
                        Book Now
                    </NuxtLink>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="ri-sofa-fill text-2xl py-2 px-3 bg-blue-200 text-primary rounded-lg"></i>
                        <div>
                            <h3 class="text-lg font-semibold">Seat A1</h3>
                            <p class="text-sm text-gray-600">10:00 AM - 12:00 PM</p>
                        </div>
                    </div>
                    <NuxtLink to="/bookings/modern-librart/seats/a1" class="px-3 py-2 rounded-lg btn btn-secondary">
                        Book Now
                    </NuxtLink>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="ri-sofa-fill text-2xl py-2 px-3 bg-blue-200 text-primary rounded-lg"></i>
                        <div>
                            <h3 class="text-lg font-semibold">Seat A1</h3>
                            <p class="text-sm text-gray-600">10:00 AM - 12:00 PM</p>
                        </div>
                    </div>
                    <NuxtLink to="/bookings/modern-librart/seats/a1" class="px-3 py-2 rounded-lg btn btn-secondary">
                        Book Now
                    </NuxtLink>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="ri-sofa-fill text-2xl py-2 px-3 bg-blue-200 text-primary rounded-lg"></i>
                        <div>
                            <h3 class="text-lg font-semibold">Seat A1</h3>
                            <p class="text-sm text-gray-600">10:00 AM - 12:00 PM</p>
                        </div>
                    </div>
                    <NuxtLink to="/bookings/modern-librart/seats/a1" class="px-3 py-2 rounded-lg btn btn-secondary">
                        Book Now
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>