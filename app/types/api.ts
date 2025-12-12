export interface RouterInfo {
  name: string
  country: string
  location: string
}

export interface CommunityMeta {
  community?: number[] | string
  large_communities?: number[]
  ext_communities?: string
  title: string
  color?: string
}

export interface CommunityDescriptor {
  communities: CommunityMeta[]
  ext_communities: CommunityMeta[]
  large_communities: CommunityMeta[]
}

export interface BgpAttributes {
  origin: string
  as_path: number[]
  local_pref: number
  med?: number
  communities?: any[]
  large_communities?: any[]
  ext_communities?: any[]
  next_hop: string
}

export interface Route {
  network: string
  gateway: string
  interface: string
  learnt_from: string
  age: string
  type: string[]
  bgp: BgpAttributes
}

export interface ApiResponse {
  api: {
    Version: string
    result_from_cache: boolean
  }
  ttl: string
  routes: Route[]
  error?: string
}
