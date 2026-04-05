<template>
    <div class="p-4 pb-36">
        <div class="text-center">
            <h1 class="text-3xl font-semibold mb-3">Find Your Perfect Study Space</h1>
            <p class="text-gray-500 font-medium">Reserve your ideal study space with ease</p>
        </div>

        <!-- Horizontal slider -->
        <div class="mt-6">
            <LoadingSpinner v-if="pending" />
            <div
                v-else
                class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            >
                <article
                    v-for="space in studySpaces"
                    :key="space.id"
                    class="min-w-[80%] max-w-sm snap-center overflow-hidden"
                >
                    <img
                        :src="space.image"
                        :alt="space.title"
                        class="w-full h-48 object-cover rounded-3xl"
                    />
                    <div class="py-4">
                        <NuxtLink to="/bookings/modern-library" class="text-lg font-semibold text-gray-900 mb-1">
                            {{ space.title }}
                        </NuxtLink>
                        <p class="text-primary leading-snug">
                            {{ space.description }}
                        </p>
                    </div>
                </article>
            </div>
        </div>

        <div class="flex items-center justify-center mt-4">
            <nuxt-link to="/bookings" class="py-4 px-6 text-center text-2xl btn btn-primary rounded-lg">
                Check Availability / Book a Seat
            </nuxt-link>
        </div>

        <div class="text-center mt-6">
            <h1 class="text-3xl font-semibold">Why Choose LibrarySeats</h1>
            <ul class="grid grid-cols-3 gap-1 mt-10">
                <li class="flex flex-col gap-2">
                    <i class="ri-time-fill text-primary text-4xl"></i>
                    <span class="text-lg font-medium">24/7 Booking</span>
                </li>
                <li class="flex flex-col gap-2">
                    <i class="ri-group-fill text-primary text-4xl"></i>
                    <span class="text-lg font-medium">Group Options</span>
                </li>
                <li class="flex flex-col gap-2">
                    <i class="ri-notification-3-fill text-primary text-4xl"></i>
                    <span class="text-lg font-medium">Smart Reminders</span>
                </li>
            </ul>
        </div>

    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLibraryStore } from '../stores/library.store'
import LoadingSpinner from '~/components/Loaders/LoadingSpinner.vue'
import study1 from '~/assets/images/study-1.png'
import study2 from '~/assets/images/study-1.png'
import study3 from '~/assets/images/study-1.png'

const studyImages = [study1, study2, study3]

const libraryStore = useLibraryStore()
const { topLibraries, isLoading, isLoaded } = storeToRefs(libraryStore)

onMounted(() => {
  if (!isLoaded.value) {
    libraryStore.fetchLibraries()
  }
})

const pending = computed(() => !isLoaded.value || isLoading.value)

const studySpaces = computed(() => {
    return topLibraries.value.map((lib, index) => ({
        id: lib.id,
        title: lib.name,
        description: lib.description || 'Discover our library facilities.',
        image: studyImages[index % studyImages.length],
    }))
})
</script>

<style scoped>
/* Hide horizontal scrollbar on mobile while keeping scroll functionality */
.scrollbar-hide {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}
</style>