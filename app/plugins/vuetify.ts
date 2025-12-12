import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const darkTheme: ThemeDefinition = {
  dark: true
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'darkTheme',
      themes: {
        darkTheme
      }
    },
    defaults: {
      global: {
        ripple: false
      },
      VCard: {
        rounded: 'xl',
        elevation: 0
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary'
      },
      VBtn: {
        rounded: 'xl',
        height: 48
      },
      VChip: {
        rounded: 'lg'
      }
    }
  })
  nuxtApp.vueApp.use(vuetify)
})
