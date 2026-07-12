import type { RouterInfo, CommunityDescriptor, CommunityMeta } from '~/types/api'
import wellknownData from '@/assets/config/communities/wellknown.json'

// Import the loader functions
import { loadCommunities, loadRouters } from '@/utils/loadConfig'

// Load communities and routers from split files
const commjson = loadCommunities()
const routerjson = loadRouters()

// Well-known template data
const wellknown = wellknownData as Record<string, Record<string, string>>

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

  // Helper: Check if a community matches a pattern (supports -1 as wildcard)
  const matchCommunityPattern = (pattern: number[], value: number[]): boolean => {
    if (pattern.length !== value.length) return false
    return pattern.every((p, i) => p === -1 || p === value[i])
  }

  // Helper: Fill template placeholders in title
  // Template value is an object with:
  // - source: number (1-based index in community array)
  // - mapping: optional string key to look up in wellknown.json
  const fillTemplate = (
    item: CommunityMeta,
    matchedValues: number[]
  ): string | undefined => {
    if (!item.template) return item.title

    let title = item.title
    const template = item.template

    // Process all placeholders in template
    for (const [placeholderKey, templateConfig] of Object.entries(template)) {
      // placeholderKey is like "origin", "country", etc. (matches {key} in title)
      const placeholder = `{${placeholderKey}}`

      if (!title.includes(placeholder)) continue

      let replacement: string | undefined

      // Get the source position (1-based to 0-based index)
      const sourcePosition = templateConfig.source
      const index = sourcePosition - 1

      if (index >= 0 && index < matchedValues.length) {
        const value = matchedValues[index]

        // If mapping is specified, look up in wellknown.json
        if (templateConfig.mapping && templateConfig.mapping in wellknown) {
          const wellKnownData = wellknown[templateConfig.mapping]
          if (wellKnownData && value !== undefined) {
            replacement = wellKnownData[String(value)]
          }
        } else {
          // No mapping, use the raw value
          replacement = String(value)
        }
      }

      if (replacement !== undefined) {
        title = title.replaceAll(placeholder, replacement)
      }
    }

    return title
  }

  // Helper: Get community value from item based on type
  const getCommunityValue = (item: any, type: keyof CommunityDescriptor): number[] | string | undefined => {
    // Try direct property: community, large_community, ext_community
    const singularType = type.replace(/ies$/, 'y').replace(/s$/, '') as string
    return item.community || item[singularType] || item[type]
  }

  // Helper: Find Community styling with template support
  const getCommunityMeta = (
    val: number[],
    type: keyof CommunityDescriptor
  ): CommunityMeta | undefined => {
    const list = communities.value[type] || []

    // First try exact match
    const valStr = JSON.stringify(val)
    const exactMatch = list.find((item: any) => {
      const itemVal = getCommunityValue(item, type)
      return JSON.stringify(itemVal) === valStr
    })

    if (exactMatch) {
      // Fill template if exists
      if (exactMatch.template) {
        const filledTitle = fillTemplate(exactMatch, val)
        return { ...exactMatch, title: filledTitle || exactMatch.title }
      }
      return exactMatch
    }

    // Try pattern match with wildcard (-1)
    const patternMatch = list.find((item: any) => {
      const itemVal = getCommunityValue(item, type)
      if (!Array.isArray(itemVal)) return false
      return matchCommunityPattern(itemVal, val)
    })

    if (patternMatch) {
      // Fill template with matched values
      if (patternMatch.template) {
        const filledTitle = fillTemplate(patternMatch, val)
        return { ...patternMatch, title: filledTitle || patternMatch.title }
      }
      return patternMatch
    }

    return undefined
  }

  return {
    getRouterInfo,
    getFlag,
    getCommunityMeta
  }
}
