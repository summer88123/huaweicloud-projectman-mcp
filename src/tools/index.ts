import type { OptionsType } from '@/types'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import registerAddIssueWorkHours from './addIssueWorkHours'
import registerSearchIssues from './searchIssues'
import registerShowIssue from './showIssue'
import registerUpdateIssue from './updateIssue'

export const registerTools = (server: McpServer, options: OptionsType) => {
  registerAddIssueWorkHours(server, options)
  registerSearchIssues(server, options)
  registerShowIssue(server, options)
  registerUpdateIssue(server, options)
}
