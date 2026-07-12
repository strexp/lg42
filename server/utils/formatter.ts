/**
 * Result formatting utilities
 */

import type { EnrichedRoute } from './routes'
import { getConfig } from './config'

interface CommunityMetaItem {
  community: number[]
  meta?: { title: string; color?: string }
}

function formatCommunities(metaList: CommunityMetaItem[]): string[] {
  if (!metaList || metaList.length === 0) {
    return []
  }
  const lines = ['Standard Communities:']
  for (const item of metaList) {
    const comm = item.community
    const meta = item.meta
    const commStr = `${comm[0]}:${comm[1]}`
    if (meta) {
      lines.push(`  ${commStr} - ${meta.title}`)
    } else {
      lines.push(`  ${commStr}`)
    }
  }
  return lines
}

function formatLargeCommunities(metaList: CommunityMetaItem[]): string[] {
  if (!metaList || metaList.length === 0) {
    return []
  }
  const lines = ['Large Communities:']
  for (const item of metaList) {
    const comm = item.community
    const meta = item.meta
    const commStr = `${comm[0]}:${comm[1]}:${comm[2]}`
    if (meta) {
      lines.push(`  ${commStr} - ${meta.title}`)
    } else {
      lines.push(`  ${commStr}`)
    }
  }
  return lines
}

function formatRoute(route: EnrichedRoute, idx: number): string {
  const lines = [`\n--- Route #${idx + 1} ---`]
  const bgp = route.bgp

  lines.push(`Network: ${route.network || 'N/A'}`)
  lines.push(`AS Path: ${(bgp?.as_path || []).join(' -> ')}`)

  // Add Next Hop with router metadata if available
  const nextHop = bgp?.next_hop
  if (nextHop) {
    const nextHopMeta = route._router_meta
    if (nextHopMeta) {
      lines.push(
        `Next Hop: ${nextHop} (${nextHopMeta.name} - ${nextHopMeta.location})`
      )
    } else {
      lines.push(`Next Hop: ${nextHop}`)
    }
  } else {
    lines.push('Next Hop: N/A')
  }

  lines.push(`Origin: ${bgp?.origin || 'N/A'}`)
  lines.push(`Local Pref: ${bgp?.local_pref ?? 'N/A'}`)

  const routerMeta = route._learnt_from_meta
  if (routerMeta) {
    lines.push(`Router: ${routerMeta.name} (${routerMeta.location})`)
  }

  if (route._communities_meta) {
    lines.push(...formatCommunities(route._communities_meta))
  }
  if (route._large_communities_meta) {
    lines.push(...formatLargeCommunities(route._large_communities_meta))
  }

  if (bgp?.med) {
    lines.push(`MED: ${bgp.med}`)
  }
  if (route.learnt_from) {
    lines.push(`Learnt From: ${route.learnt_from}`)
  }

  lines.push(`Type: ${(route.type || []).join(', ')}`)
  lines.push(`Age: ${route.age || 'N/A'}`)
  lines.push(`Primary: ${route.primary || false}`)

  return lines.join('\n')
}

export function formatResult(
  apiMeta: {
    version?: string
    cached?: string
    ttl?: string
    error?: string
    message?: string
  },
  routes: EnrichedRoute[]
): string {
  if (apiMeta.error) {
    return `Error: ${apiMeta.error}`
  }
  if (apiMeta.message) {
    return apiMeta.message
  }

  const config = getConfig()
  const maxRoutes = config.birdwatcherMaxRoutes
  const total = routes.length
  const displayed = routes.slice(0, maxRoutes)
  const omitted = total - displayed.length

  const lines = [
    '='.repeat(60),
    'API Metadata',
    '='.repeat(60),
    `Version: ${apiMeta.version || 'N/A'}`,
    `Cached: ${apiMeta.cached || 'N/A'}`,
    `TTL: ${apiMeta.ttl || 'N/A'}`,
    '',
    '='.repeat(60),
    `Routes (showing ${displayed.length}/${total})` +
      (omitted > 0 ? `, ${omitted} omitted` : ''),
    '='.repeat(60)
  ]

  for (let i = 0; i < displayed.length; i++) {
    const route = displayed[i]
    if (route) {
      lines.push(formatRoute(route, i))
    }
  }

  if (omitted > 0) {
    lines.push(`\n... (${omitted} routes omitted)`)
  }

  return lines.join('\n')
}
