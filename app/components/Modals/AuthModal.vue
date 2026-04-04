<template>
    <Transition name="fade-up">
        <div
            v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            @click.self="close"
        >
            <div class="bg-white w-full max-w-md mx-4 rounded-2xl shadow-lg p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold">{{ headerTitle }}</h2>
                    <button
                        type="button"
                        class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700"
                        @click="close"
                    >
                        <i class="ri-close-line text-lg"></i>
                    </button>
                </div>

                <!-- Tabs -->
                <div
                    v-if="currentView === 'login' || currentView === 'register'"
                    class="grid grid-cols-2 bg-gray-100 rounded-full p-1 mb-6 text-sm font-medium"
                >
                    <button
                        type="button"
                        class="py-2 rounded-full"
                        :class="currentView === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500'"
                        @click="currentView = 'login'"
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        class="py-2 rounded-full"
                        :class="currentView === 'register' ? 'bg-white shadow text-gray-900' : 'text-gray-500'"
                        @click="currentView = 'register'"
                    >
                        Register
                    </button>
                </div>

                <!-- Login form -->
                <form v-if="currentView === 'login'" class="space-y-4" @submit.prevent="submitLogin">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            v-model="loginForm.email"
                            type="email"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            v-model="loginForm.password"
                            type="password"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <span></span>
                        <button type="button" class="hover:text-gray-700" @click="goToForgotPassword">Forgot password?</button>
                    </div>
                    <button type="submit" class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold">
                        Login
                    </button>
                </form>

                <!-- Register form -->
                <form v-else-if="currentView === 'register'" class="space-y-4" @submit.prevent="submitRegister">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            v-model="registerForm.name"
                            type="text"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            v-model="registerForm.email"
                            type="email"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            v-model="registerForm.password"
                            type="password"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            v-model="registerForm.confirmPassword"
                            type="password"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold">
                        Create Account
                    </button>
                </form>

                <!-- Forgot password form -->
                <form
                    v-else-if="currentView === 'forgotPassword'"
                    class="space-y-4"
                    @submit.prevent="submitForgotPassword"
                >
                    <p class="text-sm text-gray-600">
                        Enter the email associated with your account and we will send you a verification code.
                    </p>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            v-model="forgotForm.email"
                            type="email"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <button type="button" class="hover:text-gray-700" @click="backToLogin">
                            Back to login
                        </button>
                        <span></span>
                    </div>
                    <button type="submit" class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold">
                        Send verification code
                    </button>
                </form>

                <!-- Verify code form -->
                <form
                    v-else-if="currentView === 'verifyCode'"
                    class="space-y-4"
                    @submit.prevent="submitVerifyCode"
                >
                    <p class="text-sm text-gray-600">
                        We have sent a 6-digit verification code to <span class="font-medium">{{ forgotForm.email }}</span>.
                        Enter the code below to continue.
                    </p>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Verification Code</label>
                        <input
                            v-model="verifyForm.code"
                            type="text"
                            maxlength="6"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••"
                            required
                        />
                    </div>
                    <p v-if="verifyError" class="text-xs text-red-500">
                        {{ verifyError }}
                    </p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <button type="button" class="hover:text-gray-700" @click="backToForgot">
                            Change email
                        </button>
                        <button
                            type="button"
                            class="font-medium text-primary disabled:text-gray-400 disabled:cursor-not-allowed"
                            :disabled="!canResend"
                            @click="resendCode"
                        >
                            Resend code
                            <span v-if="!canResend"> ({{ resendCountdown }}s)</span>
                        </button>
                    </div>
                    <button type="submit" class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold">
                        Verify code
                    </button>
                </form>

                <!-- Reset password form -->
                <form
                    v-else-if="currentView === 'resetPassword'"
                    class="space-y-4"
                    @submit.prevent="submitResetPassword"
                >
                    <p class="text-sm text-gray-600">
                        Set a new password for your account.
                    </p>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            v-model="resetForm.password"
                            type="password"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                            v-model="resetForm.confirmPassword"
                            type="password"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold">
                        Change password
                    </button>
                </form>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const currentView = ref<'login' | 'register' | 'forgotPassword' | 'verifyCode' | 'resetPassword'>('login')

const headerTitle = computed(() => {
    switch (currentView.value) {
        case 'register':
            return 'Create Account'
        case 'forgotPassword':
            return 'Forgot Password'
        case 'verifyCode':
            return 'Verify Code'
        case 'resetPassword':
            return 'Reset Password'
        case 'login':
        default:
            return 'Welcome'
    }
})

const loginForm = reactive({
    email: '',
    password: '',
})

const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
})

const forgotForm = reactive({
    email: '',
})

const verifyForm = reactive({
    code: '',
})

const resetForm = reactive({
    password: '',
    confirmPassword: '',
})

const generatedCode = ref<string | null>(null)
const codeExpiresAt = ref<number | null>(null)
const resendCountdown = ref(0)
const verifyError = ref<string | null>(null)

let countdownTimer: number | undefined

const canResend = computed(() => resendCountdown.value <= 0)

const startCountdown = () => {
    if (countdownTimer) {
        window.clearInterval(countdownTimer)
    }
    resendCountdown.value = 300
    countdownTimer = window.setInterval(() => {
        resendCountdown.value -= 1
        if (resendCountdown.value <= 0 && countdownTimer) {
            window.clearInterval(countdownTimer)
            countdownTimer = undefined
        }
    }, 1000)
}

onBeforeUnmount(() => {
    if (countdownTimer) {
        window.clearInterval(countdownTimer)
    }
})

const goToForgotPassword = () => {
    currentView.value = 'forgotPassword'
}

const backToLogin = () => {
    currentView.value = 'login'
}

const backToForgot = () => {
    currentView.value = 'forgotPassword'
}

const close = () => {
    currentView.value = 'login'
    emit('update:modelValue', false)
}

const submitLogin = () => {
    // TODO: integrate real auth logic
    close()
}

const submitRegister = () => {
    // TODO: integrate real registration logic
    close()
}

const submitForgotPassword = () => {
    if (!forgotForm.email) {
        return
    }

    // Simulate sending code to email
    generatedCode.value = String(Math.floor(100000 + Math.random() * 900000))
    codeExpiresAt.value = Date.now() + 5 * 60 * 1000
    verifyForm.code = ''
    verifyError.value = null
    startCountdown()
    currentView.value = 'verifyCode'
}

const resendCode = () => {
    if (!canResend.value || !forgotForm.email) return

    generatedCode.value = String(Math.floor(100000 + Math.random() * 900000))
    codeExpiresAt.value = Date.now() + 5 * 60 * 1000
    startCountdown()
}

const submitVerifyCode = () => {
    if (!generatedCode.value || !codeExpiresAt.value) {
        verifyError.value = 'No verification code has been generated.'
        return
    }
    if (Date.now() > codeExpiresAt.value) {
        verifyError.value = 'The verification code has expired. Please resend the code.'
        return
    }
    if (verifyForm.code !== generatedCode.value) {
        verifyError.value = 'Invalid verification code. Please check and try again.'
        return
    }

    verifyError.value = null
    currentView.value = 'resetPassword'
}

const submitResetPassword = () => {
    if (!resetForm.password || resetForm.password !== resetForm.confirmPassword) {
        // Optionally show validation feedback here
        return
    }

    // Simulate successful password change
    generatedCode.value = null
    codeExpiresAt.value = null
    resendCountdown.value = 0
    resetForm.password = ''
    resetForm.confirmPassword = ''
    verifyForm.code = ''

    currentView.value = 'login'
    close()
}
</script>

<style scoped>
</style>