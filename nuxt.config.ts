// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: [
    './app/assets/css/main.css',
    'remixicon/fonts/remixicon.css'
  ],
  
  app: {
    head: {
      title: 'Library Booking App',
      meta: [
        { name: 'description', content: 'Library Booking App — manage your bookings and schedules.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        // Open Graph
        { property: 'og:title', content: 'Library Booking App' },
        { property: 'og:description', content: 'Library Booking App — manage your bookings and schedules.' },
        { property: 'og:image', content: '/favicon.ico' },
        { property: 'og:type', content: 'website' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Library Booking App' },
        { name: 'twitter:description', content: 'Library Booking App — manage your bookings and schedules.' },
        { name: 'twitter:image', content: '/favicon.ico' },
      ],
      link: [
        // CSS assets from public/dashboard/assets — already bundled, no need to reinstall
        // { rel: 'stylesheet', href: '/dashboard/assets/js/vendor/@fortawesome/fontawesome-free/css/all.min.css' },
        // { rel: 'stylesheet', href: '/dashboard/assets/js/vendor/nucleo/css/nucleo-svg.css' },
        // { rel: 'stylesheet', href: '/dashboard/assets/css/dropzone.css' },
      ],
      script: [
        // { src: '/dashboard/assets/js/argon.min.js', defer: true },
      ],
    },
  },

  components: [
    {
      path: '~/components/Templates',
      prefix: 'Template'
    }
  ],
  plugins: [
  ],
  vite: {
    plugins: [
      tailwindcss() as any,
    ],
  },
  runtimeConfig: {
    databaseURL: process.env.DATABASE_URL
  }
})
