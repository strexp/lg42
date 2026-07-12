/**
 * Route fetching utilities for birdwatcher API
 */

import type { Route, ApiResponse } from '~/types/api'
import { getConfig } from './config'
import { getCommunityMeta, getLargeCommunityMeta, getRouterMeta } from './metadata'
import { validateIpOrPrefix } from '~/utils/validateIp'

export interface EnrichedRoute extends Route {
  _router_meta?: { name: string; location: string }
  _learnt_from_meta?: { name: string; location: string }
  _communities_meta?: { community: number[]; meta?: CommunityMeta }[]
  _large_communities_meta?: { community: number[]; meta?: CommunityMeta }[]
}

export interface RouteFetchResult {
  apiMeta: {
    version?: string
    cached?: string
    ttl?: string
    error?: string
    message?: string
  }
  routes: EnrichedRoute[]
}

interface CommunityMeta {
  community?: number[] | string
  large_communities?: number[]
  ext_communities?: string
  title: string
  color?: string
  template?: Record<string, { source: number; mapping?: string }>
}

/**
 * Enrich route with metadata
 */
function enrichRoute(route: Route): EnrichedRoute {
  const enriched: EnrichedRoute = { ...route }
  const bgp = route.bgp

  if (bgp?.next_hop) {
    const meta = getRouterMeta(bgp.next_hop)
    if (meta) {
      enriched._router_meta = {
        name: meta.name,
        location: meta.location
      }
    }
  }

  if (route.learnt_from && route.learnt_from !== bgp?.next_hop) {
    const meta = getRouterMeta(route.learnt_from)
    if (meta) {
      enriched._learnt_from_meta = {
        name: meta.name,
        location: meta.location
      }
    }
  }

  if (bgp?.communities) {
    enriched._communities_meta = bgp.communities.map((c) => ({
      community: Array.isArray(c) ? c : [c],
      meta: getCommunityMeta(Array.isArray(c) ? c : [c])
    }))
  }

  if (bgp?.large_communities) {
    enriched._large_communities_meta = bgp.large_communities.map((c) => ({
      community: Array.isArray(c) ? c : [c],
      meta: getLargeCommunityMeta(Array.isArray(c) ? c : [c])
    }))
  }

  return enriched
}

/**
 * Fetch route data from birdwatcher API
 */
export async function fetchRouteData(
  ipOrPrefix: string
): Promise<RouteFetchResult> {
  // Validate input
  const validation = validateIpOrPrefix(ipOrPrefix)
  if (!validation.isValid) {
    return { apiMeta: { error: validation.errorMessage }, routes: [] }
  }

  const config = getConfig()

  if (!config.birdwatcherUrl) {
    return { apiMeta: { error: 'BIRDWATCHER_URL not set' }, routes: [] }
  }

  // Select route table based on IP version
  const routeTable = validation.isIpv4
    ? config.birdwatcherRouteTable4
    : config.birdwatcherRouteTable6

  if (!routeTable) {
    return { apiMeta: { error: 'BIRDWATCHER_ROUTE_TABLE not set' }, routes: [] }
  }

  const url = `${config.birdwatcherUrl}/route/net/${ipOrPrefix}/table/${routeTable}`

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) })

    if (!response.ok) {
      if (response.status === 500) {
        return {
          apiMeta: { message: `No routes found for '${ipOrPrefix}'` },
          routes: []
        }
      }
      return {
        apiMeta: { error: `HTTP error: ${response.status}` },
        routes: []
      }
    }

    const data = (await response.json()) as ApiResponse

    if (data.error) {
      return { apiMeta: { error: data.error }, routes: [] }
    }

    const apiMeta = {
      version: data.api?.Version,
      cached: data.cached_at,
      ttl: data.ttl
    }

    const routes = data.routes || []
    const enriched = routes.map(enrichRoute)

    return { apiMeta, routes: enriched }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { apiMeta: { error: errorMessage }, routes: [] }
  }
}
