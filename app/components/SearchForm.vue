<script setup lang="ts">
import { validateIpOrPrefix } from '~/utils/validateIp'

const props = defineProps<{
  loading: boolean
  compact?: boolean
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'update:modelValue', value: string): void
}>()

const valid = ref(false)
const focused = ref(false)

const runtimeConfig = useRuntimeConfig()
const siteTitle = runtimeConfig.public.siteTitle as string
const siteDescr = runtimeConfig.public.siteDescr as string

const query = computed({
  get: () => props.modelValue || '',
  set: (val) => emit('update:modelValue', val)
})

const rules = [
  (v: string) => !!v || '',
  (v: string) => {
    const result = validateIpOrPrefix(v)
    if (result.isValid) {
      return true
    }
    return result.errorMessage
  }
]

const submit = () => {
  if (query.value) emit('search', query.value.trim())
}
</script>

<template>
  <v-card
    class="glass-panel transition-all"
    :class="compact ? 'py-4 px-6' : 'py-10 px-8'"
    elevation="0"
  >
    <div
      class="d-flex flex-column align-center overflow-hidden transition-height"
      :class="compact ? 'h-0 opacity-0' : 'h-auto mb-8 opacity-100'"
    >
      <h1 class="text-h4 text-sm-h3 text-md-h2 font-weight-bold mb-2 text-center text-primary">
        {{ siteTitle }}
      </h1>
      <div class="d-flex align-center text-medium-emphasis mt-2">
        <span class="text-subtitle-1">{{ siteDescr }}</span>
      </div>
    </div>

    <v-form @submit.prevent="submit" v-model="valid">
      <div class="d-flex flex-column flex-md-row gap-3">
        <div class="flex-grow-1 position-relative">
          <v-text-field
            v-model="query"
            :rules="rules"
            placeholder="IPv4/IPv6 Address / CIDR"
            variant="outlined"
            bg-color="rgba(15, 23, 42, 0.6)"
            :loading="loading"
            hide-details="auto"
            rounded="xl"
            class="search-input"
            @focus="focused = true"
            @blur="focused = false"
          >
            <template v-slot:prepend-inner>
              <v-icon
                icon="mdi-magnify"
                :color="focused ? 'primary' : 'grey'"
                class="transition-colors"
              />
            </template>
          </v-text-field>
        </div>

        <v-btn
          type="submit"
          color="primary"
          height="56"
          width="120"
          :loading="loading"
          :disabled="!query || !valid"
          class="flex-shrink-0 text-capitalize text-subtitle-1 font-weight-bold shadow-button hidden-sm-and-down"
        >
          Submit
        </v-btn>
        <v-btn
          type="submit"
          color="primary"
          height="56"
          width="120"
          :loading="loading"
          :disabled="!query || !valid"
          block
          class="flex-shrink-0 text-capitalize text-subtitle-1 font-weight-bold shadow-button hidden-md-and-up"
        >
          Submit
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<style scoped>
.glass-panel {
  background: rgba(30, 41, 59, 0.7) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.transition-all {
  transition: all 0.5s ease;
}

.transition-height {
  transition: all 0.5s ease;
}

.h-0 {
  height: 0 !important;
  margin: 0 !important;
}

.gap-3 {
  gap: 12px;
}

.shadow-button {
  box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39) !important;
}
</style>
