<template>
    <div class="container p-4 pb-24 space-y-6">
        <!-- Search input -->
        <SearchSearchInput v-model="query" @submit="handleSearchSubmit" />

        <!-- Filters -->
        <section>
            <h3 class="text-lg font-semibold mb-3">Filters</h3>
            <SearchSearchFilters
                v-model:date="selectedDate"
                v-model:time="selectedTime"
                v-model:seatType="selectedSeatType"
                :date-options="dateOptions"
                :time-options="timeOptions"
                :seat-type-options="seatTypeOptions"
            />
        </section>

        <!-- Results -->
        <section>
            <h3 class="text-lg font-semibold">Results</h3>
            <div class="space-y-3 mt-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="ri-book-open-line text-xl bg-blue-200 text-primary text-center w-10 h-10 p-2 rounded-lg"></i>
                        <div class="flex flex-col">
                            <h4 class="font-medium text-md line-clamp-2">Quiet Study Area</h4>
                            <p class="text-gray-400">Central Library - 1st Floor</p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="ri-book-open-line text-xl bg-blue-200 text-primary text-center w-10 h-10 p-2 rounded-lg"></i>
                        <div class="flex flex-col">
                            <h4 class="font-medium text-md line-clamp-2">Quiet Study Area</h4>
                            <p class="text-gray-400">Central Library - 1st Floor</p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="ri-book-open-line text-xl bg-blue-200 text-primary text-center w-10 h-10 p-2 rounded-lg"></i>
                        <div class="flex flex-col">
                            <h4 class="font-medium text-md line-clamp-2">Quiet Study Area</h4>
                            <p class="text-gray-400">Central Library - 1st Floor</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import SearchSearchInput from '~/components/Search/SearchInput.vue'
import SearchSearchFilters from '~/components/Search/SearchFilters.vue'
const query = ref('')

const selectedDate = ref<string | undefined>()
const selectedTime = ref<string | undefined>()
const selectedSeatType = ref<string | undefined>()

const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
]

const timeOptions = [
    { value: 'any', label: 'Any Time' },
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
]

const seatTypeOptions = [
    { value: 'any', label: 'Any Seat' },
    { value: 'individual', label: 'Individual' },
    { value: 'group', label: 'Group' },
]

const handleSearchSubmit = () => {
    // TODO: trigger search with `query.value`, selectedDate.value, selectedTime.value, selectedSeatType.value
}
</script>

<style scoped lang="scss">

</style>