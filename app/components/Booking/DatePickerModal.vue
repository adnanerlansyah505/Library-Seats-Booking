<template>
  <Transition name="fade-up">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        class="w-full bg-white px-4 pt-4 pb-8 shadow-xl rounded-lg flex flex-col max-w-md mx-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            class="w-10 h-10 p-2 rounded-full bg-gray-100 text-gray-700"
            @click="close(false)"
          >
            <i class="ri-close-line text-xl"></i>
          </button>
          <h2 class="text-lg font-semibold">Select Date</h2>
          <span class="w-8" />
        </div>

        <!-- Month navigation -->
        <div class="flex items-center justify-between mb-3">
          <button
            type="button"
            class="p-2 rounded-full text-gray-700"
            @click="prevMonth"
          >
            <i class="ri-arrow-left-s-line text-xl"></i>
          </button>
          <p class="text-base font-semibold">
            {{ monthLabel }}
          </p>
          <button
            type="button"
            class="p-2 rounded-full text-gray-700"
            @click="nextMonth"
          >
            <i class="ri-arrow-right-s-line text-xl"></i>
          </button>
        </div>

        <!-- Weekday header -->
        <div class="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
          <span v-for="d in weekdays" :key="d">{{ d }}</span>
        </div>

  <!-- Days grid -->
  <div class="grid grid-cols-7 gap-y-1 text-sm mb-4">
          <button
            v-for="day in days"
            :key="day.iso"
            type="button"
            class="mx-auto flex h-9 w-9 items-center justify-center rounded-full"
            :class="[
              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
              isSelected(day.iso) ? 'bg-primary text-white' : 'hover:bg-gray-100',
            ]"
            @click="selectDay(day.iso)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>

        <!-- Confirm button -->
        <button
          class="btn btn-primary w-full py-3 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!tempSelectedDate"
          @click="close(true)"
        >
          Select Date
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** controls modal visibility */
  modelValue: boolean
  /** bound selected date in ISO format (yyyy-mm-dd) */
  selectedDate?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:selectedDate', value: string | null): void
}>()

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth()) // 0-based

const tempSelectedDate = ref<string | null>(props.selectedDate ?? null)

watch(
  () => props.selectedDate,
  (val) => {
    tempSelectedDate.value = val ?? null
  },
)

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const monthLabel = computed(() => {
  const d = new Date(viewYear.value, viewMonth.value, 1)
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
})

const days = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const startWeekday = firstDay.getDay() // 0-6
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()

  const result: { date: Date; iso: string; isCurrentMonth: boolean }[] = []

  // leading empty days from previous month
  for (let i = 0; i < startWeekday; i++) {
    const date = new Date(viewYear.value, viewMonth.value, i - startWeekday + 1)
    result.push({ date, iso: toIso(date), isCurrentMonth: false })
  }

  // current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear.value, viewMonth.value, day)
    result.push({ date, iso: toIso(date), isCurrentMonth: true })
  }

  return result
})

const toIso = (d: Date) => d.toISOString().slice(0, 10)

const isSelected = (iso: string) => tempSelectedDate.value === iso

const selectDay = (iso: string) => {
  tempSelectedDate.value = iso
}

const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

const close = (confirm: boolean) => {
  if (confirm && tempSelectedDate.value) {
    emit('update:selectedDate', tempSelectedDate.value)
  }
  emit('update:modelValue', false)
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
