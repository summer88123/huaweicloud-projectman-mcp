import { WORK_HOUR_TYPES } from '@/projectman/constant.js'
import { getProjectManClient } from '@/projectman/index.js'
import type { OptionsType } from '@/types'
import { AddIssueWorkHoursRequest, AddIssueWorkHoursRequestBody } from '@huaweicloud/huaweicloud-sdk-projectman'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

/**
 * Register the addIssueWorkHours MCP tool
 * This tool enables adding work hour records to ProjectMan issues
 */
export default function register(server: McpServer, options: OptionsType) {
  server.registerTool(
    'addIssueWorkHours',
    {
      title: 'Add Issue Work Hours',
      description: 'Add work hour record to a HuaweiCloud ProjectMan issue',
      inputSchema: {
        projectId: z
          .string()
          .min(1, 'Project ID is required')
          .describe(
            'The ID of the project. Can be found in the URL path after "scrum/", e.g., in "projectman/scrum/3f2c4b8a9e1d5c7f6a0b8e4d2c9f7a3e/task/detail/85296341", the projectId is "3f2c4b8a9e1d5c7f6a0b8e4d2c9f7a3e"',
          ),

        issueId: z
          .number()
          .int('Issue ID must be an integer')
          .positive('Issue ID must be positive')
          .describe(
            'The ID of the issue to add work hours to. Can be found in the URL path after "detail/", e.g., in "projectman/scrum/3f2c4b8a9e1d5c7f6a0b8e4d2c9f7a3e/task/detail/85296341", the issueId is 85296341',
          ),

        workHoursTypeId: z
          .number()
          .int('Work hour type ID must be an integer')
          .describe(
            `Type of work performed. Available types:\n${Object.entries(WORK_HOUR_TYPES)
              .map(([id, name]) => `${id}: ${name}`)
              .join('\n')}`,
          ),

        workHours: z
          .number()
          .positive('Work hours must be greater than zero')
          .describe('Number of hours worked (can include decimals, e.g., 2.5)'),

        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
          .describe('Start date of the work period (YYYY-MM-DD)'),

        dueDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
          .describe('End date of the work period (YYYY-MM-DD)'),
      },
    },
    async ({ projectId, issueId, workHoursTypeId, workHours, startDate, dueDate }) => {
      try {
        // Validate date range
        if (new Date(startDate) > new Date(dueDate)) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: Start date must not be after due date',
              },
            ],
            isError: true,
          }
        }

        const clientWrapper = getProjectManClient(options)
        const client = clientWrapper.client

        const request = new AddIssueWorkHoursRequest()
        request.projectId = projectId
        request.issueId = issueId

        const body = new AddIssueWorkHoursRequestBody()
        body.withWorkHoursTypeId(workHoursTypeId)
        body.withWorkHours(workHours)
        body.withStartDate(startDate)
        body.withDueDate(dueDate)

        request.withBody(body)

        const result = await client.addIssueWorkHours(request)

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error adding work hours: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    },
  )
}
