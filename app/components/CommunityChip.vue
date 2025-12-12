<script setup lang="ts">
import type { CommunityDescriptor } from '~/types/api'

const props = defineProps<{
  value: any
  type: keyof CommunityDescriptor
}>()

const { getCommunityMeta } = useMetadata()

const meta = computed(() => getCommunityMeta(props.value, props.type))

const label = computed(() => {
  if (meta.value?.title) return meta.value.title
  if (Array.isArray(props.value)) return props.value.join(':')
  return String(props.value)
})

const color = computed(() => meta.value?.color || '#94a3b8')
</script>

<template>
  <v-chip size="x-small" class="mr-1 mb-1 font-weight-medium" :color="color" variant="tonal" label>
    {{ label }}
    <v-tooltip activator="parent" location="top" v-if="meta?.title">
      {{ Array.isArray(value) ? value.join(':') : value }}
    </v-tooltip>
  </v-chip>
</template>
