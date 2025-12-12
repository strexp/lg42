<script setup lang="ts">
import type { ApiResponse, Route } from '~/types/api'

const route = useRoute()
const router = useRouter()
const { getRouterInfo, getFlag } = useMetadata()
const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<ApiResponse | null>(null)
const panel = ref<string[]>([])
const hasSearched = ref(false)
const searchQuery = ref('')

const API_BASE = 'https://lg-api.nia.dn42'

onMounted(() => {
  if (route.query.ip) {
    const ip = route.query.ip as string
    searchQuery.value = ip
    performLookup(ip)
  }
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

const performLookup = async (query: string) => {
  if (!import.meta.client) return

  loading.value = true
  error.value = null
  result.value = null
  panel.value = []

  hasSearched.value = true

  router.replace({ query: { ...route.query, ip: query } })

  let url = ''
  if (query.includes('/')) {
    const [net, mask] = query.split('/')
    url = `${API_BASE}/route/net/${net}/mask/${mask}/table/master6`
  } else {
    url = `${API_BASE}/route/net/${query}/table/master6`
  }

  try {
    const data = await $fetch<ApiResponse>(url)
    if (data.error || !data.routes) {
      throw new Error(
        data.error === 'bird unreachable'
          ? 'Router unreachable or invalid query.'
          : data.error || 'Unknown API Error'
      )
    }

    if (data.routes.length === 0) {
      throw new Error('No matching routing entry found.')
    }

    setTimeout(() => {
      result.value = data
    }, 300)
  } catch (e: any) {
    if (e.response?.status === 404) {
      error.value = 'No matching routing entry found.'
    } else {
      error.value = e.message || 'Failed to fetch data'
    }
  } finally {
    loading.value = false
  }
}

const groupedRoutes = computed(() => {
  if (!result.value?.routes) return {}
  const groups: Record<string, Route[]> = {}
  result.value.routes.forEach((route) => {
    const nh = route.learnt_from
    if (!groups[nh]) groups[nh] = []
    groups[nh].push(route)
  })
  for (const key in groups) {
    groups[key]?.sort((a, b) => b.bgp.local_pref - a.bgp.local_pref)
  }
  return groups
})
</script>

<template>
  <v-container
    fluid
    class="fill-height flex-column align-center transition-all px-4"
    :class="hasSearched ? 'justify-start pt-10' : 'justify-center'"
  >
    <div class="w-100 transition-width" :style="{ maxWidth: hasSearched ? '1000px' : '600px' }">
      <SearchForm
        :loading="loading"
        :compact="hasSearched"
        @search="performLookup"
        v-model="searchQuery"
        class="mb-6"
      />
    </div>

    <div v-if="error" class="w-100 animate-fade-in" style="max-width: 1000px">
      <v-alert color="error" variant="tonal" icon="mdi-alert-circle" border="start" rounded="xl">
        {{ error }}
      </v-alert>
    </div>

    <div v-if="result" class="w-100 animate-fade-in" style="max-width: 1000px">
      <v-row dense class="mb-4">
        <v-col cols="12" sm="4" md="3">
          <v-sheet
            class="glass-effect py-2 px-4 d-flex align-center justify-space-between"
            rounded="xl"
          >
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon icon="mdi-server" size="small" class="mr-2" />
              API Version
            </div>
            <span class="text-body-2 font-weight-bold">{{ result.api.Version }}</span>
          </v-sheet>
        </v-col>

        <v-col cols="12" sm="4" md="3">
          <v-sheet
            class="glass-effect py-2 px-4 d-flex align-center justify-space-between"
            rounded="xl"
          >
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon icon="mdi-database" size="small" class="mr-2" />
              Cache
            </div>
            <v-chip
              size="x-small"
              :color="result.api.result_from_cache ? 'success' : 'info'"
              variant="flat"
              class="font-weight-bold"
            >
              {{ result.api.result_from_cache ? 'HIT' : 'MISS' }}
            </v-chip>
          </v-sheet>
        </v-col>

        <v-col cols="12" sm="4" md="6">
          <v-sheet class="glass-effect py-2 px-4 d-flex align-center" rounded="xl">
            <v-icon icon="mdi-clock-outline" size="small" class="mr-2 text-medium-emphasis" />
            <span class="text-caption text-medium-emphasis mr-2">TTL:</span>
            <span class="text-body-2 font-mono">{{ formatDate(result.ttl) }}</span>
          </v-sheet>
        </v-col>
      </v-row>

      <v-expansion-panels v-model="panel" variant="default" class="custom-panels">
        <v-expansion-panel
          v-for="(routes, nextHop) in groupedRoutes"
          :key="nextHop"
          elevation="0"
          bg-color="transparent"
          class="glass-effect mb-0 border-thin"
          rounded="xl"
        >
          <v-expansion-panel-title class="py-4">
            <template v-slot:default="{ expanded }">
              <v-row align="center" no-gutters>
                <v-col cols="auto" class="mr-4">
                  <div class="flag-container text-h4">
                    {{ getFlag(getRouterInfo(String(nextHop)).country) }}
                  </div>
                </v-col>

                <v-col>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ getRouterInfo(String(nextHop)).name }}
                    <v-chip class="ml-2" size="x-small">{{ nextHop }}</v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis d-flex align-center mt-1">
                    <span class="d-none d-sm-flex align-center">
                      <v-icon size="x-small" icon="mdi-map-marker" class="mr-1" />
                      {{ getRouterInfo(String(nextHop)).location }}
                    </span>
                  </div>
                </v-col>

                <v-col cols="auto" class="d-flex align-center">
                  <v-chip
                    class="mr-2"
                    size="small"
                    :color="expanded ? 'primary' : 'surface-variant'"
                    variant="flat"
                  >
                    {{ routes.length }} Route{{ routes.length > 1 ? 's' : '' }}
                  </v-chip>
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <RouteList :routes="routes" :nodeip="nextHop" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <div class="text-center text-caption text-disabled mt-8 pb-8">
      Niantic Network @ AS4242421331
    </div>
  </v-container>
</template>

<style scoped>
.transition-all {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.transition-width {
  transition: max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-effect {
  background: rgba(30, 41, 59, 0.6) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.bg-surface-light {
  background: rgba(255, 255, 255, 0.05);
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.v-expansion-panel-title) {
  padding: 16px 24px;
}
</style>
