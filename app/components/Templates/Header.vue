<template>
    <div>
        <header class="bg-white shadow">
            <div class="container p-4">
                <div class="grid grid-cols-3 items-center">
                    <div class="flex justify-start">
                        <button type="button" @click="handleBackClick" class="cursor-pointer shadow py-1 px-2 rounded-lg text-gray-600 hover:text-gray-800" v-if="showBackButton">
                            <i class="ri-arrow-left-s-line text-xl"></i>
                        </button>
                    </div>
                    <div class="text-center">
                        <h3 class="text-lg font-semibold text-gray-800 whitespace-nowrap">{{ title }}</h3>
                    </div>
                    <div class="flex justify-end">
                        <!-- <NuxtLink to="/profile" class="w-12 h-12 rounded-full overflow-hidden" v-if="route.path !== '/profile'">
                            <img src="~/assets/images/photo-profile.png" alt="Photo Profile">
                        </NuxtLink> -->
                        <button
                            type="button"
                            class="w-10 h-10 p-2 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out"
                            @click="isAuthOpen = true"
                        >
                            <i class="ri-login-box-line text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>
        <AuthModal v-model="isAuthOpen" />
    </div>
</template>

<script setup lang="ts">
import { pageSeo } from '~/utils/constants/web/seo';
import AuthModal from '~/components/Modals/AuthModal.vue';

const route = useRoute();
const router = useRouter();
const isAuthOpen = ref(false);

// Helper: support headerTitle as string or function(route)
const resolveSeoValue = (value: any) => {
    if (!value) return '';
    return typeof value === 'function' ? value(route) : value;
};

const title = computed(() => {
    const key = (route?.name || route.path) as string;
    const cfg = pageSeo[key];
    return resolveSeoValue(cfg?.headerTitle);
});

const hasHistory = ref(false);

onMounted(() => {
    if (import.meta.client) {
        hasHistory.value = window.history.length > 1;
    }
})

const showBackButton = computed(() => {
    if (route?.name === 'index') {
        return false;
    }
    const showBack = pageSeo[route?.name as string]?.showBack;
    return showBack !== undefined ? showBack : hasHistory.value;
})

const handleBackClick = () => {
    if (hasHistory.value) {
        return router.back()
    }
    return router.push('/')
}

</script>

<style scoped>

</style>