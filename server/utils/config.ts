/**
 * Server-side configuration for MCP Birdwatcher
 */

export interface McpConfig {
  birdwatcherUrl: string
  birdwatcherRouteTable4: string
  birdwatcherRouteTable6: string
  birdwatcherMaxRoutes: number
}

export function getConfig(): McpConfig {
  const config = useRuntimeConfig()

  return {
    birdwatcherUrl: config.public.apiBase || process.env.BIRDWATCHER_URL || '',
    birdwatcherRouteTable4:
      config.birdwatcherRouteTable4 ||
      process.env.BIRDWATCHER_ROUTE_TABLE4 ||
      'master4',
    birdwatcherRouteTable6:
      config.birdwatcherRouteTable6 ||
      process.env.BIRDWATCHER_ROUTE_TABLE6 ||
      'master6',
    birdwatcherMaxRoutes:
      parseInt(config.birdwatcherMaxRoutes || process.env.BIRDWATCHER_MAX_ROUTES || '50', 10) || 50
  }
}
