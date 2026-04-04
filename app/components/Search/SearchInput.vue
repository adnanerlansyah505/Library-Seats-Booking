<template>
  <div class="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
    <i class="ri-search-line text-xl text-gray-400"></i>
    <input
      :value="modelValue"
      type="text"
      class="w-full bg-transparent border-none outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
      :placeholder="placeholder"
      @input="onInput"
      @keyup.enter="onEnter"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: 'Search for seats, rooms, or sections',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const onEnter = () => {
  emit('submit')
}
</script>

<style scoped>
</style>
