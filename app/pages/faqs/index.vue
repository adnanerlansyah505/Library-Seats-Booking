<template>
    <div class="container p-4">
        <div class="mb-6">
            <h1 class="text-2xl font-bold">Frequently Asked Questions</h1>
            <div class="mt-6 space-y-3">
                <div
                    v-for="(item, index) in faqs"
                    :key="item.id"
                    class="rounded-2xl border border-gray-200 bg-white px-4 py-3"
                >
                    <button
                        type="button"
                        class="flex w-full items-center justify-between gap-3 text-left"
                        @click="toggle(index)"
                    >
                        <span class="text-sm font-semibold text-gray-900">{{ item.question }}</span>
                        <i
                            class="ri-arrow-down-s-line text-lg text-gray-500 transition-transform duration-200"
                            :class="{ 'rotate-180': openIndex === index }"
                        ></i>
                    </button>
                    <div
                        v-show="openIndex === index"
                        class="mt-2 text-sm text-gray-600 leading-relaxed"
                    >
                        {{ item.answer }}
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-6">
            <h1 class="text-2xl font-bold">Contact Us</h1>
            <div class="space-y-3 mt-4">
                <div class="flex items-center gap-3">
                    <i class="ri-phone-line text-xl w-10 h-10 p-2 rounded-lg bg-blue-200 text-center"></i>
                    <div class="flex flex-col">
                        <h4 class="font-semibold text-lg">Call Us</h4>
                        <span class="text-gray-600 font-medium">+1 (555) 123-4567</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <i class="ri-mail-line text-xl w-10 h-10 p-2 rounded-lg bg-blue-200 text-center"></i>
                    <div class="flex flex-col">
                        <h4 class="font-semibold text-lg">Email Us</h4>
                        <span class="text-gray-600 font-medium">example@example.com</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const faqs = [
    {
        id: 1,
        question: 'How do I book a seat?',
        answer:
            'Go to the Search page, choose your date, time, and seat type, then tap on an available seat to complete your booking.',
    },
    {
        id: 2,
        question: 'Can I cancel or change my booking?',
        answer:
            'Yes. Open the My Bookings page, select the booking you want to change, and follow the instructions to cancel or update it.',
    },
    {
        id: 3,
        question: 'Do I need to check in at the library?',
        answer:
            'Some libraries require you to check in at the front desk or via QR code within 15 minutes of your start time. Please follow the instructions in your booking details.',
    },
]

const openIndex = ref<number | null>(0)

const toggle = (index: number) => {
    openIndex.value = openIndex.value === index ? null : index
}
</script>

<style lang="scss" scoped>

</style>