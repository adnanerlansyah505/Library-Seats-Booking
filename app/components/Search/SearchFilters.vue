<template>
  <div ref="rootEl" class="flex gap-2">
    <!-- Date filter -->
    <div class="relative">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800"
        @click="toggle('date')"
      >
        <span>{{ currentDateLabel }}</span>
        <i class="ri-arrow-down-s-line text-lg text-gray-500"></i>
      </button>
      <div
        v-if="openFilter === 'date'"
        class="absolute left-0 mt-2 w-40 rounded-2xl bg-white shadow-lg border border-gray-100 z-10"
      >
        <button
          v-for="option in dateOptions"
          :key="option.value"
          type="button"
          class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          @click="selectDate(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Time filter -->
    <div class="relative">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800"
        @click="toggle('time')"
      >
        <span>{{ currentTimeLabel }}</span>
        <i class="ri-arrow-down-s-line text-lg text-gray-500"></i>
      </button>
      <div
        v-if="openFilter === 'time'"
        class="absolute left-0 mt-2 w-40 rounded-2xl bg-white shadow-lg border border-gray-100 z-10"
      >
        <button
          v-for="option in timeOptions"
          :key="option.value"
          type="button"
          class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          @click="selectTime(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Seat type filter -->
    <div class="relative">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800"
        @click="toggle('seatType')"
      >
        <span>{{ currentSeatTypeLabel }}</span>
        <i class="ri-arrow-down-s-line text-lg text-gray-500"></i>
      </button>
      <div
        v-if="openFilter === 'seatType'"
        class="absolute left-0 mt-2 w-40 rounded-2xl bg-white shadow-lg border border-gray-100 z-10"
      >
        <button
          v-for="option in seatTypeOptions"
          :key="option.value"
          type="button"
          class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          @click="selectSeatType(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type FilterKey = 'date' | 'time' | 'seatType'

const props = withDefaults(
  defineProps<{
    dateLabel?: string
    timeLabel?: string
    seatTypeLabel?: string
    date?: string
    time?: string
    seatType?: string
    dateOptions: { value: string; label: string }[]
    timeOptions: { value: string; label: string }[]
    seatTypeOptions: { value: string; label: string }[]
  }>(),
  {
    dateLabel: 'Date',
    timeLabel: 'Time',
    seatTypeLabel: 'Seat Type',
  },
)

const emit = defineEmits<{
  (e: 'update:date', value: string): void
  (e: 'update:time', value: string): void
  (e: 'update:seatType', value: string): void
}>()

const openFilter = ref<FilterKey | null>(null)

const currentDateLabel = computed(
  () => props.dateOptions.find((o) => o.value === props.date)?.label || props.dateLabel,
)

const currentTimeLabel = computed(
  () => props.timeOptions.find((o) => o.value === props.time)?.label || props.timeLabel,
)

const currentSeatTypeLabel = computed(
  () =>
    props.seatTypeOptions.find((o) => o.value === props.seatType)?.label ||
    props.seatTypeLabel,
)

const toggle = (key: FilterKey) => {
  openFilter.value = openFilter.value === key ? null : key
}

const selectDate = (value: string) => {
  emit('update:date', value)
  openFilter.value = null
}

const selectTime = (value: string) => {
  emit('update:time', value)
  openFilter.value = null
}

const selectSeatType = (value: string) => {
  emit('update:seatType', value)
  openFilter.value = null
}

// Close dropdowns when clicking outside the component
const rootEl = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (!openFilter.value) return
  const target = event.target as Node | null
  if (rootEl.value && target && !rootEl.value.contains(target)) {
    openFilter.value = null
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('click', handleClickOutside, true)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('click', handleClickOutside, true)
  }
})
</script>

<style scoped>
</style>
