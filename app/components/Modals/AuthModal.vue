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

                <!-- Success alert UI is handled globally in Header via events -->

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
                    <p v-if="loginError" class="text-xs text-red-500">
                        {{ loginError }}
                    </p>
                    <button
                        type="submit"
                        class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        :disabled="isSubmitting"
                    >
                        <span v-if="isSubmitting">Logging in...</span>
                        <span v-else>Login</span>
                    </button>
                </form>

                <!-- Register form -->
                <form v-else-if="currentView === 'register'" class="space-y-4" @submit.prevent="submitRegister">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Student ID <span class="text-red-400">*</span></label>
                        <input
                            v-model="registerForm.studentId"
                            type="text"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="12345678"
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Full Name <span class="text-red-400">*</span></label>
                        <input
                            v-model="registerForm.name"
                            type="text"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Email <span class="text-red-400">*</span></label>
                        <input
                            v-model="registerForm.email"
                            type="email"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Password <span class="text-red-400">*</span></label>
                        <input
                            v-model="registerForm.password"
                            type="password"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Confirm Password <span class="text-red-400">*</span></label>
                        <input
                            v-model="registerForm.confirmPassword"
                            type="password"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <p v-if="registerError" class="text-xs text-red-500">
                        {{ registerError }}
                    </p>
                    <button
                        type="submit"
                        class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        :disabled="isSubmitting"
                    >
                        <span v-if="isSubmitting">Creating account...</span>
                        <span v-else>Create Account</span>
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
                    <p v-if="forgotError" class="text-xs text-red-500">
                        {{ forgotError }}
                    </p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <button type="button" class="hover:text-gray-700" @click="backToLogin">
                            Back to login
                        </button>
                        <span></span>
                    </div>
                    <button
                        type="submit"
                        class="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        :disabled="isSubmitting"
                    >
                        <span v-if="isSubmitting">Creating account...</span>
                        <span v-else>Send verification code</span>
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
                            :disabled="!canResend || isSubmitting"
                            @click="resendCode"
                        >
                            <span v-if="isSubmitting">Resending...</span>
                            <span v-else>Resend code</span>
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
import { useAuthStore } from '~/stores/auth.store'

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'login-success', payload: { title: string; message: string }): void
    (e: 'register-success', payload: { title: string; message: string }): void
}>()

const currentView = ref<'login' | 'register' | 'forgotPassword' | 'verifyCode' | 'resetPassword'>('login')

const authStore = useAuthStore()
const isSubmitting = ref(false)
const loginError = ref<string | null>(null)
const registerError = ref<string | null>(null)
const forgotError = ref<string | null>(null)

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
    studentId: '',
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

const submitLogin = async () => {
    if (!loginForm.email || !loginForm.password) return

    isSubmitting.value = true
    loginError.value = null

    try {
        await authStore.login({
            email: loginForm.email,
            password: loginForm.password,
        })

        // Notify parent (Header) to show global success alert
        emit('login-success', {
            title: 'Login successful',
            message: 'You have logged in successfully.',
        })

		// Close modal after successful login so the alert is fully visible
		close()
    }
    catch (error: any) {
        console.log(error)
        // Try to extract a meaningful message from backend error
        loginError.value =
            error?.data?.message ||
            error?.statusMessage ||
            'Login failed. Please check your credentials and try again.'
    }
    finally {
        isSubmitting.value = false
    }
}

const submitRegister = async () => {
    if (!registerForm.email || !registerForm.password || registerForm.password !== registerForm.confirmPassword) {
        registerError.value = 'Please fill all fields and make sure passwords match.'
        return
    }

    isSubmitting.value = true
    registerError.value = null

    // Map simple form fields to RegisterRequest structure
    const [firstNameRaw, ...rest] = registerForm.name.trim().split(' ')
    const firstName = firstNameRaw || registerForm.email
    const lastName = rest.join(' ') || firstName

    try {
        await authStore.register({
            email: registerForm.email,
            password: registerForm.password,
            firstName,
            lastName,
            role: 'student',
            phone: '',
            username: registerForm.email,
            studentId: registerForm.studentId,
        })

        // After successful registration, switch to login view
        currentView.value = 'login'

        // Notify parent (Header) to show global success alert
        emit('register-success', {
            title: 'Account created',
            message: 'Account created successfully. You can now log in.',
        })

		// Optionally close modal after successful registration as well
		close()
    }
    catch (error: any) {
        registerError.value =
            error?.data?.message ||
            error?.statusMessage ||
            'Registration failed. Please try again.'
    }
    finally {
        isSubmitting.value = false
    }
}

const submitForgotPassword = async () => {
    if (!forgotForm.email) {
        forgotError.value = 'Please enter your email.'
        return
    }

    isSubmitting.value = true
    forgotError.value = null
    verifyError.value = null

    try {
		await authStore.requestPasswordReset(forgotForm.email)

        // Start countdown and go to verify-code step
        startCountdown()
        verifyForm.code = ''
        currentView.value = 'verifyCode'
    }
    catch (error: any) {
        forgotError.value =
            error?.data?.message ||
            error?.statusMessage ||
            'Unable to send verification code. Please try again.'
    }
    finally {
        isSubmitting.value = false
    }
}

const resendCode = async () => {
    if (!canResend.value || !forgotForm.email) return

    try {
		await authStore.requestPasswordReset(forgotForm.email)
        startCountdown()
    }
    catch (error: any) {
        verifyError.value =
            error?.data?.message ||
            error?.statusMessage ||
            'Unable to resend verification code. Please try again.'
    }
}

const submitVerifyCode = async () => {
    if (!forgotForm.email || !verifyForm.code) {
        verifyError.value = 'Please enter the verification code.'
        return
    }

    verifyError.value = null

    try {
		await authStore.verifyResetCode(forgotForm.email, verifyForm.code)
        currentView.value = 'resetPassword'
    }
    catch (error: any) {
        verifyError.value =
            error?.data?.message ||
            error?.statusMessage ||
            'Invalid or expired verification code. Please try again.'
    }
}

const submitResetPassword = async () => {
    if (!resetForm.password || resetForm.password !== resetForm.confirmPassword) {
        // Basic validation feedback
        verifyError.value = 'Passwords do not match.'
        return
    }
    if (!forgotForm.email || !verifyForm.code) {
        verifyError.value = 'Verification code is missing. Please restart the reset process.'
        return
    }

    isSubmitting.value = true
    verifyError.value = null

    try {
        await authStore.resetPassword({
            email: forgotForm.email,
            code: verifyForm.code,
            password: resetForm.password,
        })

        // Clear local state
        resendCountdown.value = 0
        resetForm.password = ''
        resetForm.confirmPassword = ''
        verifyForm.code = ''

        // Inform parent so it can show a success toast
        emit('login-success', {
            title: 'Password updated',
            message: 'Your password has been changed. You can now log in.',
        })

        currentView.value = 'login'
    }
    catch (error: any) {
        verifyError.value =
            error?.data?.message ||
            error?.statusMessage ||
            'Unable to reset password. Please try again.'
    }
    finally {
        isSubmitting.value = false
    }
}
</script>

<style scoped>
</style>