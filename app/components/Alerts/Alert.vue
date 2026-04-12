<template>
    <Transition :name="transitionName">
        <div v-if="isVisible" :class="outerClasses" id="alert">
            <div
                :class="[
                    'flex items-center gap-3 rounded-xl border px-3 py-2 text-sm',
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
                    <p v-else-if="message" class="text-xs text-white">
                        {{ message }}
                    </p>
                </div>

                <!-- Close button -->
                <button
                    v-if="closable"
                    type="button"
                    class="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5 text-xs text-white"
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
        /**
         * Auto-hide duration in milliseconds. Set to 0 or null to disable auto-hide.
         * Defaults to 4000ms.
         */
        duration?: number | null
    }>(),
    {
        variant: 'neutral',
        showIcon: true,
        closable: true,
        duration: 4000,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const isVisible = ref(props.modelValue ?? true)
let hideTimeout: number | null = null

watch(
    () => props.modelValue,
    (val) => {
        if (val === undefined) return
        isVisible.value = val
    },
)

const clearHideTimeout = () => {
    if (hideTimeout !== null) {
        window.clearTimeout(hideTimeout)
        hideTimeout = null
    }
}

const scheduleAutoHide = () => {
    clearHideTimeout()
    if (props.duration && props.duration > 0) {
        hideTimeout = window.setTimeout(() => {
            handleClose()
        }, props.duration)
    }
}

const outerClasses = computed(() => {
    const baseInline = 'w-full'
    const baseFixed = 'fixed z-[9999] max-w-sm w-[calc(100%-2rem)] text-white'

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

const transitionName = computed(() => {
    if (props.position === 'top-right' || props.position === 'bottom-right') {
        return 'fade-right'
    }
    if (props.position === 'top-left' || props.position === 'bottom-left') {
        return 'fade-left'
    }
    return 'fade'
})

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'primary':
            return 'border-primary/20 bg-primary'
        case 'secondary':
            return 'border-secondary/20 bg-secondary'
        case 'success':
            return 'border-success/20 bg-success'
        case 'danger':
            return 'border-danger/20 bg-danger'
        case 'warning':
            return 'border-yellow-300 bg-yellow-50'
        case 'info':
            return 'border-sky-300 bg-sky-50'
        case 'neutral':
        default:
            return 'border-gray-200 bg-gray-50'
    }
})

const iconClass = computed(() => {
    switch (props.variant) {
        case 'success':
            return 'ri-checkbox-circle-line'
        case 'danger':
            return 'ri-error-warning-line'
        case 'warning':
            return 'ri-alert-line'
        case 'info':
            return 'ri-information-line'
        case 'primary':
            return 'ri-information-line'
        case 'secondary':
            return 'ri-information-line'
        case 'neutral':
    default:
            return 'ri-information-line'
    }
})

const handleClose = () => {
    isVisible.value = false
    emit('update:modelValue', false)
}

watch(
    () => isVisible.value,
    (visible) => {
        if (visible) {
            scheduleAutoHide()
        }
        else {
            clearHideTimeout()
        }
    },
    { immediate: true },
)

onBeforeUnmount(() => {
    clearHideTimeout()
})
</script>

<style scoped>
/* Shared transition timing */
.fade-enter-active,
.fade-leave-active,
.fade-right-enter-active,
.fade-right-leave-active,
.fade-left-enter-active,
.fade-left-leave-active {
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

/* Default vertical fade (used for inline & fallback) */
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

/* Slide/fade from the right for right-side toasts */
.fade-right-enter-from,
.fade-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.fade-right-enter-to,
.fade-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Slide/fade from the left for left-side toasts */
.fade-left-enter-from,
.fade-left-leave-to {
  opacity: 0;
  transform: translateX(-80px); /* symmetric to the left */
}

.fade-left-enter-to,
.fade-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>