<template>
    <div>
        <header class="bg-white shadow">
            <div class="p-4">
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
                        <!-- Auth button / avatar -->
                        <button
                            v-if="!isAuthenticated"
                            type="button"
                            class="w-10 h-10 p-2 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out"
                            @click="isAuthOpen = true"
                        >
                            <i class="ri-login-box-line text-xl"></i>
                        </button>

                        <div v-else class="relative">
                            <button
                                type="button"
                                class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden hover:bg-primary/90 transition"
                                @click="toggleUserMenu"
                            >
                                <!-- User avatar image if available -->
                                <img
                                    v-if="userAvatarUrl"
                                    :src="userAvatarUrl"
                                    alt="User avatar"
                                    class="w-full h-full object-cover"
                                />
                                <!-- Fallback: first letter of name/email -->
                                <span v-else class="font-semibold text-sm">
                                    {{ userInitial }}
                                </span>
                            </button>

                            <Transition name="fade">
                                <div
                                    v-if="isUserMenuOpen"
                                    class="absolute right-0 mt-2 w-40 rounded-lg bg-white shadow-lg border border-gray-100 py-1 text-sm z-10000"
                                >
                                    <button
                                        type="button"
                                        class="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                        @click="goToProfile"
                                    >
                                        <i class="ri-user-line text-base text-gray-500"></i>
                                        <span>Profile</span>
                                    </button>
                                    <button
                                        type="button"
                                        class="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                        @click="handleLogout"
                                    >
                                        <i class="ri-logout-box-r-line text-base"></i>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <AuthModal
            v-model="isAuthOpen"
            @login-success="showSuccessAlert"
            @register-success="showSuccessAlert"
        />

        <!-- Global success alert toast (visibility controlled via v-model; internal Transition handles animation) -->
        <Alert
            v-model="successAlert.visible"
            variant="success"
            :title="successAlert.title"
            :message="successAlert.message"
            position="top-right"
        />
    </div>
</template>

<script setup lang="ts">
import { pageSeo } from '~/utils/constants/web/seo';
import AuthModal from '~/components/Modals/AuthModal.vue';
import Alert from '~/components/Alerts/Alert.vue';
import { useAuthStore } from '~/stores/auth.store';

const route = useRoute();
const router = useRouter();
const isAuthOpen = ref(false);

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const isUserMenuOpen = ref(false);

const userInitial = computed(() => {
    const user = authStore.user;
    const source = user?.firstName || user?.lastName || user?.email || '';
    return source ? source.charAt(0).toUpperCase() : '?';
});

// Optional avatar URL support if backend adds it later
const userAvatarUrl = computed<string | null>(() => {
    return (authStore.user as any)?.avatarUrl ?? null;
});

const successAlert = reactive({
    visible: false,
    title: '',
    message: '',
});

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

    // Restore auth state from cookies and fetch user if already logged in
    authStore.checkAuth().catch(() => {
        // ignore errors here; user will just be treated as logged out
    });
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

const showSuccessAlert = (payload: { title: string; message: string }) => {
    successAlert.title = payload.title
    successAlert.message = payload.message
    successAlert.visible = true
}

const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value
}

const goToProfile = () => {
    isUserMenuOpen.value = false
    if (route.path !== '/profile') {
        router.push('/profile')
    }
}

const handleLogout = async () => {
    isUserMenuOpen.value = false
    await authStore.logout()
}

</script>

<style scoped>

</style>