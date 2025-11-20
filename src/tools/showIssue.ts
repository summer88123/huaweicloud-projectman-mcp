import { CUSTOM_FIELDS } from '@/projectman/constant.js'
import { getProjectManClient } from '@/projectman/index.js'
import { SimplifiedIssue } from '@/projectman/types'
import { convertUser } from '@/projectman/util'
import type { OptionsType } from '@/types'
import { ShowIssueV4Request } from '@huaweicloud/huaweicloud-sdk-projectman'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

/**
 * Register the showIssue MCP tool
 * This tool enables retrieving detailed information about a specific issue in ProjectMan
 */
export default function register(server: McpServer, options: OptionsType) {
  server.registerTool(
    'showIssue',
    {
      title: 'Show Issue Details',
      description: 'Retrieve detailed information about a specific issue in HuaweiCloud ProjectMan',
      inputSchema: {
        projectId: z
          .string()
          .min(1, 'Project ID is required')
          .describe(
            'The ID of the project. Can be found in the URL path after "scrum/", e.g., in "projectman/scrum/ea9762777b694cbe8b099d7f6acb453c/task/detail/70427972", the projectId is "ea9762777b694cbe8b099d7f6acb453c"',
          ),

        issueId: z
          .number()
          .int('Issue ID must be an integer')
          .positive('Issue ID must be positive')
          .describe(
            'The ID of the issue to retrieve. Can be found in the URL path after "detail/", e.g., in "projectman/scrum/ea9762777b694cbe8b099d7f6acb453c/task/detail/70427972", the issueId is 70427972',
          ),
      },
    },
    async ({ projectId, issueId }) => {
      try {
        const clientWrapper = getProjectManClient(options)
        const client = clientWrapper.client

        const request = new ShowIssueV4Request()
        request.projectId = projectId
        request.issueId = issueId

        const result = await client.showIssueV4(request)

        // Simplify the response for LLM-friendly format
        const simplifiedIssue: SimplifiedIssue = {
          issueId: result.id!,
          subject: result.name || '',
          tracker: result.tracker?.name || '',
          status: result.status?.name || '',
          priority: result.priority?.name || '',
          severity: result.severity?.name,
          domain: result.domain?.name,
          // @ts-ignore
          assignedTo: convertUser(result.assigned_user),
          author: convertUser(result.creator),
          developer: convertUser(result.developer),
          // @ts-ignore
          expectedWorkHours: result.expected_work_hours || 0,
          // @ts-ignore
          actualWorkHours: result.actual_work_hours || 0,
          // @ts-ignore
          parentIssue: result.parent_issue
            ? {
                // @ts-ignore
                id: result.parent_issue.id!,
                // @ts-ignore
                subject: result.parent_issue.subject || '',
              }
            : undefined,
          // @ts-ignore
          projectId: result.project?.project_id || '',
        }
        // Filter by CUSTOM_FIELDS defined in constants
        const validCustomFieldIds = CUSTOM_FIELDS.map(cf => cf.customField)
        // Include additional details
        const detailedResponse = {
          ...simplifiedIssue,
          // @ts-ignore
          beginTime: result.begin_time,
          // @ts-ignore
          endTime: result.end_time,
          // @ts-ignore
          customFields: result.new_custom_fields
            ?.filter((field: any) => {
              return validCustomFieldIds.includes(field.custom_field)
            })
            .map((field: any) => ({
              customField: field.custom_field,
              name: field.field_name,
              type: field.field_type,
              value: field.value,
            })),
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(detailedResponse, null, 2),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error retrieving issue: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    },
  )
}
