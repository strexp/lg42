<!-- components/RouteList.vue -->
<template>
  <div class="route-list">
    <div
      v-for="(route, i) in routes"
      :key="i"
      class="route-item py-4 px-2 rounded-lg transition-colors"
    >
      <div class="d-flex flex-wrap align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-chip
            size="x-small"
            :color="
              route.bgp.as_path
                ? route.learnt_from == route.bgp.next_hop
                  ? 'indigo-lighten-2'
                  : 'orange-lighten-2'
                : 'teal-lighten-2'
            "
            variant="tonal"
            class="mr-3 font-weight-bold"
            label
          >
            {{
              route.bgp.as_path
                ? route.learnt_from == route.bgp.next_hop
                  ? 'eBGP'
                  : 'iBGP'
                : 'IGP'
            }}
          </v-chip>
          <span class="text-h6 font-weight-medium font-mono text-high-emphasis">
            {{ route.network }}
            <v-chip v-if="i == 0" class="ml-2" size="small" color="success">Primary</v-chip>
          </span>
        </div>

        <div class="d-flex align-center text-caption gap-4">
          <div class="metric-box text-end">
            <div class="text-xs text-medium-emphasis text-uppercase font-weight-bold">
              Local Pref
            </div>
            <div class="text-success font-weight-bold text-body-2">{{ route.bgp.local_pref }}</div>
          </div>
          <div class="metric-box text-end">
            <div class="text-xs text-medium-emphasis text-uppercase font-weight-bold">MED</div>
            <div class="text-body-2">{{ route.bgp.med ?? '-' }}</div>
          </div>
          <div class="metric-box text-end">
            <div class="text-xs text-medium-emphasis text-uppercase font-weight-bold">Age</div>
            <div class="text-body-2">{{ formatAge(route.age) }}</div>
          </div>
        </div>
      </div>

      <div class="pl-md-1">
        <div v-if="route.bgp.as_path?.length" class="mb-2 d-flex align-center flex-wrap">
          <span
            class="text-caption font-weight-bold text-disabled mr-2 text-uppercase"
            style="min-width: 60px"
            >AS Path</span
          >
          <div class="d-flex flex-wrap align-center font-mono text-body-2">
            <template v-if="route.learnt_from != route.bgp.next_hop">
              <span class="asn-link text-grey-lighten-2 px-1 rounded transition-colors">
                {{ meta.getRouterInfo(route.bgp.next_hop).name }}
              </span>
              <v-icon icon="mdi-arrow-right-thin" size="small" class="mx-1 text-disabled" />
            </template>
            <template v-for="(asn, idx) in route.bgp.as_path" :key="idx">
              <span
                class="asn-link text-grey-lighten-2 px-1 rounded transition-colors"
                :title="'AS' + asn"
              >
                {{ asn }}
              </span>
              <v-icon
                v-if="idx < route.bgp.as_path.length - 1"
                icon="mdi-arrow-right-thin"
                size="small"
                class="mx-1 text-disabled"
              />
            </template>
          </div>
        </div>

        <div v-if="hasCommunities(route)" class="d-flex align-start mt-2">
          <span
            class="text-caption font-weight-bold text-disabled mr-2 text-uppercase mt-1"
            style="min-width: 60px"
            >Comm</span
          >
          <div class="d-flex flex-column" style="gap: 8px">
            <!-- Regular Communities -->
            <div v-if="route.bgp.communities?.length" class="d-flex flex-wrap" style="gap: 4px">
              <CommunityChip
                v-for="c in route.bgp.communities"
                :key="JSON.stringify(c)"
                :value="c"
                type="communities"
              />
            </div>
            <!-- Extended Communities -->
            <div v-if="route.bgp.ext_communities?.length" class="d-flex flex-wrap" style="gap: 4px">
              <CommunityChip
                v-for="c in route.bgp.ext_communities"
                :key="JSON.stringify(c)"
                :value="c"
                type="ext_communities"
              />
            </div>
            <!-- Large Communities Grouped by ASN -->
            <div
              v-if="route.bgp.large_communities?.length"
              class="d-flex flex-column"
              style="gap: 4px"
            >
              <div
                v-for="(items, asn) in groupLargeCommunities(route.bgp.large_communities)"
                :key="asn"
                class="d-flex align-center"
              >
                <div class="d-flex flex-wrap" style="gap: 4px">
                  <v-chip
                    size="x-small"
                    color="default"
                    variant="outlined"
                    class="mr-2 font-weight-bold"
                    label
                  >
                    {{ asn }}
                  </v-chip>
                  <CommunityChip
                    v-for="c in items"
                    :key="JSON.stringify(c)"
                    :value="c"
                    type="large_communities"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Route } from '~/types/api'
import { formatDistanceToNow } from 'date-fns'
import { useMetadata } from '~/composables/useMetadata'

defineProps<{
  routes: Route[]
  nodeip: string
}>()

const meta = useMetadata()

const formatAge = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true }).replace('about ', '')
  } catch {
    return dateStr
  }
}

const hasCommunities = (r: Route) => {
  return (
    r.bgp.communities?.length || r.bgp.large_communities?.length || r.bgp.ext_communities?.length
  )
}

const groupLargeCommunities = (communities: any[]): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {}
  for (const c of communities) {
    if (Array.isArray(c) && c.length >= 1) {
      const asn = String(c[0])
      if (!grouped[asn]) {
        grouped[asn] = []
      }
      grouped[asn].push(c)
    }
  }
  return grouped
}
</script>

<style scoped>
.gap-4 {
  gap: 24px;
}
.hover-bg:hover {
  background-color: rgba(255, 255, 255, 0.03);
}
.route-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
}
.asn-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: help;
}
</style>
