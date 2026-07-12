import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://lg-api.nia.dn42',
      siteTitle: process.env.NUXT_PUBLIC_SITE_TITLE || 'lookingglass42',
      siteDescr: process.env.NUXT_PUBLIC_SITE_DESCR || 'DN42 Looking Glass',
      siteFooter: process.env.NUXT_PUBLIC_SITE_FOOTER || 'dn42 Network Looking Glass'
    },
    // Server-side config for MCP birdwatcher
    birdwatcherRouteTable4: process.env.BIRDWATCHER_ROUTE_TABLE4 || 'master4',
    birdwatcherRouteTable6: process.env.BIRDWATCHER_ROUTE_TABLE6 || 'master6',
    birdwatcherMaxRoutes: process.env.BIRDWATCHER_MAX_ROUTES || '50'
  },

  build: {
    transpile: ['vuetify']
  },

  modules: ['@nuxt/eslint', '@nuxtjs/mcp-toolkit'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: process.env.NUXT_PUBLIC_SITE_TITLE || 'DN42 Looking Glass',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: process.env.NUXT_PUBLIC_SITE_DESCR || 'DN42 Looking Glass' },
        { name: 'theme-color', content: '#0f172a' }
      ],
      link: [
        // Ensure you have a favicon or remove this
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

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
  },

  mcp: {
    name: 'dn42 Network Looking Glass MCP'
  }
})
