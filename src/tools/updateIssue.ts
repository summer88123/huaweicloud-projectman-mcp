import { CUSTOM_FIELDS } from '@/projectman/constant.js'
import { getProjectManClient } from '@/projectman/index.js'
import type { OptionsType } from '@/types'
import { IssueRequestV4, NewCustomField, UpdateIssueV4Request } from '@huaweicloud/huaweicloud-sdk-projectman'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

/**
 * Generate custom fields description from CUSTOM_FIELDS constant
 */
function generateCustomFieldsDescription(): string {
  const fieldDescriptions = CUSTOM_FIELDS.map((field, index) => {
    const optionsText = field.options ? `options: ${field.options.join(', ')}` : 'free text input'
    return `${index + 1}) ${field.customField} (${field.name}, ${field.type}) - ${optionsText}`
  })
  return `Array of custom fields to update. Available fields: ${fieldDescriptions.join('; ')}`
}

/**
 * Register the updateIssue MCP tool
 * This tool enables updating issues in HuaweiCloud ProjectMan
 */
export default function register(server: McpServer, options: OptionsType) {
  server.registerTool(
    'updateIssue',
    {
      title: 'Update Issue',
      description:
        'Update an existing issue in HuaweiCloud ProjectMan. Can update status, assignees, custom fields, and more.',
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
            'The ID of the issue to update. Can be found in the URL path after "detail/", e.g., in "projectman/scrum/3f2c4b8a9e1d5c7f6a0b8e4d2c9f7a3e/task/detail/85296341", the issueId is 85296341',
          ),

        statusId: z.number().int('Status ID must be an integer').optional().describe('New status ID for the issue'),

        developerId: z
          .number()
          .int('Developer ID must be an integer')
          .optional()
          .describe('ID of the developer to assign'),

        assignedId: z
          .number()
          .int('Assigned ID must be an integer')
          .optional()
          .describe('ID of the user to assign the issue to'),

        customFields: z
          .array(
            z.object({
              customField: z.string().describe('Custom field ID'),
              value: z.string().describe('Value to set for the custom field'),
            }),
          )
          .optional()
          .describe(generateCustomFieldsDescription()),
      },
    },
    async ({ projectId, issueId, statusId, developerId, assignedId, customFields }) => {
      try {
        const clientWrapper = getProjectManClient(options)
        const client = clientWrapper.client

        const request = new UpdateIssueV4Request()
        request.projectId = projectId
        request.issueId = issueId

        const body = new IssueRequestV4()

        // Update status if provided
        if (statusId !== undefined) {
          body.withStatusId(statusId)
        }

        // Update developer if provided
        if (developerId !== undefined) {
          body.withDeveloperId(developerId)
        }

        // Update assigned user if provided
        if (assignedId !== undefined) {
          body.withAssignedId(assignedId)
        }

        // Update custom fields if provided
        if (customFields && customFields.length > 0) {
          const customFieldsList = customFields.map(field =>
            new NewCustomField().withCustomField(field.customField).withValue(field.value),
          )
          body.withNewCustomFields(customFieldsList)
        }

        request.withBody(body)

        const result = await client.updateIssueV4(request)

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
              text: `Error updating issue: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    },
  )
}
