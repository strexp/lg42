import type { RouterInfo, CommunityDescriptor, CommunityMeta } from '~/types/api'
import commjson from '@/assets/config/comm-descr.json'
import routerjson from '@/assets/config/routers.json'

export const useMetadata = () => {
  const routers = useState<Record<string, RouterInfo>>('routers', () => routerjson)
  const communities = useState<CommunityDescriptor>('communities', () => commjson)

  const getRouterInfo = (nextHop: string) => {
    return (
      routers.value[nextHop] || {
        name: 'Unknown Router',
        country: '',
        location: 'Unknown Location'
      }
    )
  }

  // Helper: Convert Country Code to Flag Emoji
  const getFlag = (cc: string) => {
    if (!cc) return '🌐'
    const codePoints = cc
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  // Helper: Find Community styling
  const getCommunityMeta = (
    val: any,
    type: keyof CommunityDescriptor
  ): CommunityMeta | undefined => {
    const list = communities.value[type] || []
    const valStr = JSON.stringify(val)

    return list.find((item: any) => {
      // Logic handles the varying structure of the JSON keys
      const itemVal = item.community || item[type.slice(0, -1)] || item[type]
      return JSON.stringify(itemVal) === valStr
    })
  }

  return {
    getRouterInfo,
    getFlag,
    getCommunityMeta
  }
}
