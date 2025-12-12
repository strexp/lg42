import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify']
  },

  modules: ['@nuxt/eslint'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'DN42 Looking Glass',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Niantic Network DN42 Looking Glass - IPv6 Only' },
        { name: 'theme-color', content: '#0f172a' }
      ],
      link: [
        // Ensure you have a favicon or remove this
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  vite: {
    plugins: [vuetify({ autoImport: true })],
    vue: {
      template: {
        transformAssetUrls
      }
    }
  }
})
