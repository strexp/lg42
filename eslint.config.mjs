import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt([eslintPluginPrettierRecommended]).override('nuxt/typescript', {
  rules: {
    'nuxt/nuxt-config-keys-order': 'off'
  }
})
