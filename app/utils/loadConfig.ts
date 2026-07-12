/**
 * Shared configuration loader for routers and communities
 * Used by both client-side and server-side code
 */

import type { RouterInfo, CommunityDescriptor, CommunityMeta } from '~/types/api'

// Router imports
import routers4242421331 from '@/assets/config/routers/4242421331.json'
import routers4242420803 from '@/assets/config/routers/4242420803.json'

// Standard community imports
import generalCommunities from '@/assets/config/communities/standard/general.json'
import latency42Communities from '@/assets/config/communities/standard/dn42-latency.json'
import bandwidth42Communities from '@/assets/config/communities/standard/dn42-bandwidth.json'
import encryption42Communities from '@/assets/config/communities/standard/dn42-encryption.json'
import origin42Communities from '@/assets/config/communities/standard/dn42-origin.json'

// Large community imports
import comm4242421331 from '@/assets/config/communities/large/4242421331.json'
import comm4242420803 from '@/assets/config/communities/large/4242420803.json'
import comm4242422601 from '@/assets/config/communities/large/4242422601.json'
import comm4242422189 from '@/assets/config/communities/large/4242422189.json'
import comm4242423914 from '@/assets/config/communities/large/4242423914.json'

// Router data
const routerImports = [routers4242421331, routers4242420803]

// Community data
const standardCommunityImports = [
  generalCommunities,
  latency42Communities,
  bandwidth42Communities,
  encryption42Communities,
  origin42Communities
]

const largeCommunityImports = [
  comm4242421331,
  comm4242420803,
  comm4242422601,
  comm4242422189,
  comm4242423914
]

/**
 * Load all router data from split JSON files
 * Merges all split files into a single Record<string, RouterInfo>
 */
export function loadRouters(): Record<string, RouterInfo> {
  return routerImports.reduce((acc, routers) => ({ ...acc, ...routers }), {})
}

/**
 * Load all community data from split JSON files
 * Merges all split files into the original structure
 */
export function loadCommunities(): CommunityDescriptor {
  return {
    communities: standardCommunityImports.flatMap(c => c as CommunityMeta[]),
    ext_communities: [],
    large_communities: largeCommunityImports.flatMap(c => c as CommunityMeta[])
  }
}
