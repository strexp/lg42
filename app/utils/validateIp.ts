/**
 * Shared IP address and prefix validation utilities
 * Works in both client and server environments
 */
import { Address4, Address6 } from 'ip-address'

export interface ValidationResult {
  isValid: boolean
  errorMessage: string
  isIpv4?: boolean
  isIpv6?: boolean
}

/**
 * DN42 IPv4 CIDR ranges
 * - 172.20.0.0/14 (172.20.0.0 - 172.23.255.255)
 * - 172.31.0.0/16 (172.31.0.0 - 172.31.255.255)
 * - 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
 */
const DN42_IPV4_CIDRS = [
  new Address4('172.20.0.0/14'),
  new Address4('172.31.0.0/16'),
  new Address4('10.0.0.0/8')
]

/**
 * DN42 IPv6 CIDR range: fd00::/8
 */
const DN42_IPV6_CIDR = new Address6('fd00::/8')

/**
 * Check if an IPv4 address is in DN42 private ranges
 */
export function isDn42Ipv4(address: Address4): boolean {
  for (const cidr of DN42_IPV4_CIDRS) {
    if (address.isInSubnet(cidr)) {
      return true
    }
  }
  return false
}

/**
 * Check if an IPv6 address is in DN42 private range (fd00::/8)
 */
export function isDn42Ipv6(address: Address6): boolean {
  return address.isInSubnet(DN42_IPV6_CIDR)
}

/**
 * Validate if the input is a valid IPv4/IPv6 address or prefix in DN42 ranges
 */
export function validateIpOrPrefix(ipOrPrefix: string): ValidationResult {
  if (!ipOrPrefix) {
    return { isValid: false, errorMessage: 'Input cannot be empty' }
  }

  const trimmed = ipOrPrefix.trim()

  // Check for prefix notation (contains /)
  if (trimmed.includes('/')) {
    try {
      // Try parsing as IPv4 CIDR first
      if (Address4.isValid(trimmed)) {
        const addr4 = new Address4(trimmed)
        if (isDn42Ipv4(addr4)) {
          return { isValid: true, errorMessage: '', isIpv4: true }
        }
        return { isValid: false, errorMessage: 'Not a DN42 IPv4 prefix (172.20.0.0/14, 172.31.0.0/16, 10.0.0.0/8)' }
      }

      // Try parsing as IPv6 CIDR
      if (Address6.isValid(trimmed)) {
        const addr6 = new Address6(trimmed)
        if (isDn42Ipv6(addr6)) {
          return { isValid: true, errorMessage: '', isIpv6: true }
        }
        return { isValid: false, errorMessage: 'Not a DN42 IPv6 prefix (fd00::/8)' }
      }

      return { isValid: false, errorMessage: 'Invalid IP prefix format' }
    } catch {
      return { isValid: false, errorMessage: 'Invalid IP prefix' }
    }
  }

  // Single IP address
  try {
    // Try IPv4 first
    if (Address4.isValid(trimmed)) {
      const addr4 = new Address4(trimmed)
      if (isDn42Ipv4(addr4)) {
        return { isValid: true, errorMessage: '', isIpv4: true }
      }
      return { isValid: false, errorMessage: 'Not a DN42 IPv4 address (172.20.0.0/14, 172.31.0.0/16, 10.0.0.0/8)' }
    }

    // Try IPv6
    if (Address6.isValid(trimmed)) {
      const addr6 = new Address6(trimmed)
      if (isDn42Ipv6(addr6)) {
        return { isValid: true, errorMessage: '', isIpv6: true }
      }
      return { isValid: false, errorMessage: 'Not a DN42 IPv6 address (fd00::/8)' }
    }

    return { isValid: false, errorMessage: 'Invalid IP address format' }
  } catch {
    return { isValid: false, errorMessage: 'Invalid IP address' }
  }
}

/**
 * Normalize IP address or prefix to standard format
 */
export function normalizeIpOrPrefix(ipOrPrefix: string): string {
  return ipOrPrefix.trim()
}

/**
 * Detect if the query is an IPv4 address/prefix
 * This is a quick check without full validation
 */
export function isIpv4(query: string): boolean {
  const trimmed = query.trim()
  // Check if it looks like IPv4 (has dots and no colons)
  if (trimmed.includes('.') && !trimmed.includes(':')) {
    return Address4.isValid(trimmed)
  }
  // For CIDR with IPv4
  if (trimmed.includes('/')) {
    const [addr] = trimmed.split('/')
    if (addr?.includes('.') && !addr?.includes(':')) {
      return Address4.isValid(trimmed)
    }
  }
  return false
}
