// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },

    modules: ['@nuxt/eslint', 'shadcn-nuxt', '@nuxtjs/color-mode', '@vueuse/nuxt', '@pinia/nuxt'],

    vite: {
        plugins: [tailwindcss()],
    },

    ssr: false,
    css: ['~/assets/style/tailwind.css', '~/assets/style/base.scss', 'vue-sonner/style.css'],
    components: [
        {
            path: '~/core/components',
            prefix: 'Doc',
            extensions: ['.vue'],
        },
    ],
    imports: {
        dirs: ['./core/**'],
    },
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.API_BASE_URL,
            clientBaseUrl: process.env.CLIENT_BASE_URL,
        },
    },
})
