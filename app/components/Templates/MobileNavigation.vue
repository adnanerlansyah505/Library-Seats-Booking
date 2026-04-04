<template>
    <footer class="fixed bottom-0 left-0 right-0 z-50 bg-white shadow border-t border-gray-300 py-4">
        <div class="flex items-center justify-between max-w-[85%] mx-auto text-center">
            <NuxtLink class="py-2 flex flex-col gap-1 font-medium" to="/">
                <i class="ri-home-4-line text-xl"></i>
                <span>Home</span>
            </NuxtLink>
            <NuxtLink class="py-2 flex flex-col gap-1 font-medium" to="/search">
                <i class="ri-search-line text-xl"></i>
                <span class="font-medium">Search</span>
            </NuxtLink>
            <NuxtLink class="py-2 flex flex-col gap-1 font-medium" to="/my-bookings">
                <i class="ri-book-line text-xl"></i>
                <span class="font-medium">My Bookings</span>
            </NuxtLink>
            <NuxtLink class="py-2 flex flex-col gap-1 font-medium" to="/faqs">
                <i class="ri-question-line text-xl"></i>
                <span class="font-medium">Help</span>
            </NuxtLink>
        </div>
    </footer>
</template>

<script setup>

</script>

<style scoped>
a {
    color: var(--color-gray-600); /* Tailwind's gray-600 */
    transition: color 0.2s ease;
}
.router-link-active {
    color: var(--color-primary); /* Tailwind's gray-800 */
    font-weight: 600;
}
.router-link-active i {
    fill: var(--color-primary);
}
</style>