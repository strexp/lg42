/**
 * Metadata utilities for router and community information
 * Uses shared config loader
 */

import type { RouterInfo, CommunityMeta } from '~/types/api'
import { loadRouters, loadCommunities } from '@/utils/loadConfig'

// Load all data
const routers = loadRouters()
const communitiesData = loadCommunities()

// Build lookup maps for O(1) access
const communitiesMap: Map<string, CommunityMeta> = new Map()
for (const item of communitiesData.communities) {
  if (item.community && Array.isArray(item.community)) {
    const key = JSON.stringify(item.community)
    communitiesMap.set(key, item)
  }
}

const largeCommunitiesMap: Map<string, CommunityMeta> = new Map()
for (const item of communitiesData.large_communities) {
  if (item.large_communities && Array.isArray(item.large_communities)) {
    const key = JSON.stringify(item.large_communities)
    largeCommunitiesMap.set(key, item)
  }
}

/**
 * Get router metadata by IP
 */
export function getRouterMeta(ip: string): RouterInfo | undefined {
  return routers[ip]
}

/**
 * Get community metadata
 */
export function getCommunityMeta(community: number[]): CommunityMeta | undefined {
  const key = JSON.stringify(community)
  return communitiesMap.get(key)
}

/**
 * Get large community metadata
 */
export function getLargeCommunityMeta(community: number[]): CommunityMeta | undefined {
  const key = JSON.stringify(community)
  return largeCommunitiesMap.get(key)
}

/**
 * Get all router metadata
 */
export function getAllRouters(): Record<string, RouterInfo> {
  return { ...routers }
}
