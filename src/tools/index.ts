import type { OptionsType } from '@/types'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import registerAddIssueWorkHours from './addIssueWorkHours'
import registerSearchIssues from './searchIssues'

export const registerTools = (server: McpServer, options: OptionsType) => {
  registerAddIssueWorkHours(server, options)
  registerSearchIssues(server, options)
}
