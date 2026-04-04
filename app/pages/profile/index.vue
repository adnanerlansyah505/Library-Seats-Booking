<template>
    <div class="container px-4 pt-4 pb-32">
        <div class="max-w-md mx-auto mt-4">
            <img
                src="~/assets/images/photo-profile.png"
                alt="Photo Profile"
                class="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h2 class="text-2xl font-semibold text-center mb-2">{{ profile.name }}</h2>
            <p class="text-center text-gray-600 mb-4">Member since 2018</p>
        </div>
        <div class="mt-8 max-w-md mx-auto">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold">Personal Information</h3>
                <button
                    v-if="!isEditing"
                    type="button"
                    class="text-primary text-xl hover:text-primary/80"
                    @click="startEdit"
                >
                    <i class="ri-pencil-line"></i>
                </button>
            </div>

            <div class="mt-4 space-y-4">
                <!-- Edit form -->
                <template v-if="isEditing">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-600" for="full-name">Full Name <span class="text-red-400">*</span></label>
                        <input
                            id="full-name"
                            v-model="profile.name"
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-600" for="email">Email <span class="text-red-400">*</span></label>
                        <input
                            id="email"
                            v-model="profile.email"
                            type="email"
                            class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-600" for="phone">Phone <span class="text-red-400">*</span></label>
                        <input
                            id="phone"
                            v-model="profile.phone"
                            type="phone"
                            class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div class="flex justify-end gap-3 pt-2">
                        <button type="button" class="btn btn-outline-secondary" @click="cancelEdit">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" @click="saveEdit">
                            Save
                        </button>
                    </div>
                </template>

                <!-- Read-only preview -->
                <template v-else>
                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">Full Name</p>
                        <p class="font-medium text-gray-900">{{ profile.name }}</p>
                    </div>

                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">Email</p>
                        <p class="font-medium text-gray-900">{{ profile.email }}</p>
                    </div>

                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">Phone Number</p>
                        <p class="font-medium text-gray-900">{{ profile.phone }}</p>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const isEditing = ref(false)

const profile = reactive({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '087748310753',
    address: 'Grove Street 104.S',
})

const startEdit = () => {
    isEditing.value = true
}

const cancelEdit = () => {
    isEditing.value = false
}

const saveEdit = () => {
    isEditing.value = false
    // TODO: hook this up to an API call when backend is ready
}
</script>

<style scoped>

</style>