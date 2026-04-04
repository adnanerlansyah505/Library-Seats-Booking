<template>
  <div class="error-page d-flex align-items-center justify-content-center">
    <div class="error-card text-center">
      <div class="error-code">{{ statusCode }}</div>
      <h1 class="error-title">{{ title }}</h1>
      <p class="error-desc">{{ description }}</p>

      <div class="mt-4 d-flex justify-content-center gap-2">
        <button class="btn btn-primary" @click="goHome">Go to Home</button>
        <button v-if="canBack" class="btn btn-outline-secondary" @click="goBack">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: { type: Object, default: () => ({ statusCode: 500, message: 'An error occurred' }) }
})

import { useRouter } from 'vue-router'
const router = useRouter()

const statusCode = props.error?.statusCode || props.error?.status || 500

// Provide friendly title/description per status code
const messages: Record<string, { title: string; desc: string }> = {
  '401': {
    title: 'Unauthorized',
    desc: 'You are not authorized to view this page. Please sign in or contact support if you think this is a mistake.'
  },
  '404': {
    title: 'Page not found',
    desc: 'We couldn\'t find the page you were looking for. The link may be broken or the page may have been removed.'
  },
  '500': {
    title: 'Server error',
    desc: 'Something went wrong on our end. Try refreshing the page, or come back later.'
  }
}

const lookup = messages[String(statusCode)] || { title: `Error ${statusCode}`, desc: props.error?.message || 'An unexpected error occurred.' }

const title = lookup.title
const description = lookup.desc

const canBack = typeof window !== 'undefined' && window.history && window.history.length > 1

function goHome () {
  router.push('/')
}

function goBack () {
  if (canBack) window.history.back()
}
</script>

<style scoped>
.error-page { min-height: 70vh; padding: 40px; }
.error-card { max-width: 720px; background: #fff; padding: 36px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.error-code { font-size: 92px; font-weight: 800; color: #0d6efd; }
.error-title { font-size: 24px; margin-top: 8px; font-weight: 700; }
.error-desc { color: #666; margin-top: 12px; }

@media (max-width: 576px) {
  .error-code { font-size: 48px; }
  .error-card { padding: 20px; }
}
</style>
