<template>
    <Transition name="fade">
        <div v-if="isVisible" :class="outerClasses">
            <div
                :class="[
                    'flex items-start gap-3 rounded-xl border px-3 py-2 text-sm',
                    variantClasses,
                ]"
            >
                <!-- Icon -->
                <i
                    v-if="showIcon"
                    :class="['mt-0.5 text-lg', iconClass]"
                ></i>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <p v-if="title" class="font-semibold mb-0.5 truncate">
                        {{ title }}
                    </p>
                    <!-- Slot takes priority -->
                    <div v-if="$slots.default" class="text-xs text-gray-700">
                        <slot />
                    </div>
                    <p v-else-if="message" class="text-xs text-gray-700">
                        {{ message }}
                    </p>
                </div>

                <!-- Close button -->
                <button
                    v-if="closable"
                    type="button"
                    class="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5 text-xs text-gray-500"
                    @click="handleClose"
                >
                    <i class="ri-close-line text-base"></i>
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
type Variant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'neutral'

type Position =
    | 'inline'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'

const props = withDefaults(
    defineProps<{
        /** Controls visibility (use with v-model). If omitted, starts visible. */
        modelValue?: boolean
        /** Visual style of the alert. */
        variant?: Variant
        /** Optional title text. */
        title?: string
        /** Optional message text (used when no default slot). */
        message?: string
        /** Show leading icon? */
        showIcon?: boolean
        /** Show close button and allow dismiss? */
        closable?: boolean
        /** Where the alert is shown. 'inline' keeps it in the flow; others are fixed corners. */
        position?: Position
    }>(),
    {
        variant: 'neutral',
        showIcon: true,
        closable: true,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const isVisible = ref(props.modelValue ?? true)

watch(
    () => props.modelValue,
    (val) => {
        if (val === undefined) return
        isVisible.value = val
    },
)

const outerClasses = computed(() => {
    const baseInline = 'w-full'
    const baseFixed = 'fixed z-50 max-w-sm w-[calc(100%-2rem)] pointer-events-none'

    switch (props.position) {
        case 'top-left':
            return `${baseFixed} top-4 left-4 flex justify-start`;
        case 'top-right':
            return `${baseFixed} top-4 right-4 flex justify-end`;
        case 'bottom-left':
            return `${baseFixed} bottom-4 left-4 flex justify-start`;
        case 'bottom-right':
            return `${baseFixed} bottom-4 right-4 flex justify-end`;
        case 'inline':
        default:
            return baseInline;
    }
})

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'primary':
            return 'border-primary/20 bg-primary/10 text-primary'
        case 'secondary':
            return 'border-secondary/20 bg-secondary/10 text-secondary'
        case 'success':
            return 'border-success/20 bg-success/10 text-success'
        case 'danger':
            return 'border-danger/20 bg-danger/10 text-danger'
        case 'warning':
            return 'border-yellow-300 bg-yellow-50 text-yellow-800'
        case 'info':
            return 'border-sky-300 bg-sky-50 text-sky-800'
        case 'neutral':
        default:
            return 'border-gray-200 bg-gray-50 text-gray-800'
    }
})

const iconClass = computed(() => {
    switch (props.variant) {
        case 'success':
            return 'ri-checkbox-circle-line text-success'
        case 'danger':
            return 'ri-error-warning-line text-danger'
        case 'warning':
            return 'ri-alert-line text-yellow-500'
        case 'info':
            return 'ri-information-line text-sky-500'
        case 'primary':
            return 'ri-information-line text-primary'
        case 'secondary':
            return 'ri-information-line text-secondary'
        case 'neutral':
    default:
            return 'ri-information-line text-gray-500'
    }
})

const handleClose = () => {
    isVisible.value = false
    emit('update:modelValue', false)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>