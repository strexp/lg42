import { z } from 'zod'
import { fetchRouteData } from '../../utils/routes'
import { formatResult } from '../../utils/formatter'

export default defineMcpTool({
  description: 'Query route information for an IP or prefix in DN42 network',
  inputSchema: {
    ip_or_prefix: z.string().describe('IP address or CIDR prefix to query. Supports DN42 IPv4 (172.20.0.0/14, 172.31.0.0/16, 10.0.0.0/8) and DN42 IPv6 (fd00::/8)')
  },
  async handler({ ip_or_prefix }) {
    const { apiMeta, routes } = await fetchRouteData(ip_or_prefix)
    const result = formatResult(apiMeta, routes)
    return {
      content: [{ type: 'text', text: result }]
    }
  }
})
