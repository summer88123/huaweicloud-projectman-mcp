import type { OptionsType } from '@/types'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import registerAddIssueWorkHours from './addIssueWorkHours'
import registerGetData from './registerGetData'

export const registerTools = (server: McpServer, options: OptionsType) => {
  registerGetData(server, options)
  registerAddIssueWorkHours(server, options)
}
