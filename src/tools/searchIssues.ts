import { PRIORITY_TYPES, STATUS_TYPES, TRACKER_TYPES } from '@/projectman/constant.js'
import { getProjectManClient } from '@/projectman/index.js'
import { SimplifiedIssue } from '@/projectman/types'
import { convertUser } from '@/projectman/util'
import type { OptionsType } from '@/types'
import { ListWorkTableIssueRequestV4RequestBody, SearchIssuesRequest } from '@huaweicloud/huaweicloud-sdk-projectman'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

/**
 * Register the searchIssues MCP tool
 * This tool enables searching and filtering issues in ProjectMan
 */
export default function register(server: McpServer, options: OptionsType) {
  server.registerTool(
    'searchIssues',
    {
      title: 'Search Issues',
      description:
        'Search and filter work items in HuaweiCloud ProjectMan. Returns simplified issue data optimized for AI analysis.',
      inputSchema: {
        offset: z
          .number()
          .int('Offset must be an integer')
          .min(0, 'Offset must be non-negative')
          .optional()
          .describe('Number of items to skip (for pagination, default: 0)'),

        limit: z
          .number()
          .int('Limit must be an integer')
          .min(1, 'Limit must be at least 1')
          .max(100, 'Limit cannot exceed 100')
          .optional()
          .describe('Maximum number of items to return (default: 20, max: 100)'),

        subject: z.string().optional().describe('Filter by issue subject/title (partial match)'),

        createdOn: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Created date must be in YYYY-MM-DD format')
          .optional()
          .describe('Filter by creation date (YYYY-MM-DD)'),

        updatedOn: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Updated date must be in YYYY-MM-DD format')
          .optional()
          .describe('Filter by last update date (YYYY-MM-DD)'),

        closedOn: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Closed date must be in YYYY-MM-DD format')
          .optional()
          .describe('Filter by closure date (YYYY-MM-DD)'),

        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
          .optional()
          .describe('Filter by planned start date (YYYY-MM-DD)'),

        dueDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
          .optional()
          .describe('Filter by due date (YYYY-MM-DD)'),

        trackerId: z
          .string()
          .optional()
          .describe(
            `Filter by tracker ID (work item type). Supports multiple values separated by commas (e.g., "2,3"). Available types:\n${Object.entries(
              TRACKER_TYPES,
            )
              .map(([id, name]) => `${id}: ${name}`)
              .join('\n')}`,
          ),

        statusId: z
          .string()
          .optional()
          .describe(
            `Filter by status ID. Supports multiple values separated by commas (e.g., "1,2,3"). Available statuses:\n${Object.entries(
              STATUS_TYPES,
            )
              .map(([id, name]) => `${id}: ${name}`)
              .join('\n')}`,
          ),

        authorId: z
          .string()
          .optional()
          .describe('Filter by author/creator user ID. Supports multiple values separated by commas (e.g., "123,456")'),

        developerId: z
          .string()
          .optional()
          .describe(
            'Filter by assigned developer user ID. Supports multiple values separated by commas (e.g., "123,456")',
          ),

        priorityId: z
          .string()
          .optional()
          .describe(
            `Filter by priority ID. Supports multiple values separated by commas (e.g., "2,3"). Available priorities:\n${Object.entries(
              PRIORITY_TYPES,
            )
              .map(([id, name]) => `${id}: ${name}`)
              .join('\n')}`,
          ),
      },
    },
    async ({
      offset,
      limit = 20,
      subject,
      createdOn,
      updatedOn,
      closedOn,
      startDate,
      dueDate,
      trackerId,
      statusId,
      authorId,
      developerId,
      priorityId,
    }) => {
      try {
        const clientWrapper = getProjectManClient(options)
        const client = clientWrapper.client

        const request = new SearchIssuesRequest()
        const body = new ListWorkTableIssueRequestV4RequestBody()

        // Apply pagination parameters
        if (offset !== undefined) {
          body.withOffset(offset)
        }
        if (limit !== undefined) {
          body.withLimit(limit)
        }

        // Apply filter parameters
        if (subject) {
          body.withSubject(subject)
        }
        if (createdOn) {
          body.withCreatedOn(createdOn)
        }
        if (updatedOn) {
          body.withUpdatedOn(updatedOn)
        }
        if (closedOn) {
          body.withClosedOn(closedOn)
        }
        if (startDate) {
          body.withStartDate(startDate)
        }
        if (dueDate) {
          body.withDueDate(dueDate)
        }
        if (trackerId) {
          body.withTrackerId(trackerId)
        }
        if (statusId) {
          body.withStatusId(statusId)
        }
        if (authorId) {
          body.withAuthorId(authorId)
        }
        if (developerId) {
          body.withDeveloperId(developerId)
        }
        if (priorityId) {
          body.withPriorityId(priorityId)
        }

        request.withBody(body)

        const result = await client.searchIssues(request)

        // Simplify the response for LLM-friendly format
        const simplifiedIssues: SimplifiedIssue[] =
          // @ts-ignore
          result.issue_list?.map(issue => ({
            issueId: issue.id,
            subject: issue.subject,
            tracker: issue.tracker?.name,
            status: issue.status?.name,
            priority: issue.priority?.name,
            domain: issue.domain?.name,
            assignedTo: convertUser(issue.assigned_to),
            author: convertUser(issue.author),
            developer: convertUser(issue.developer),
            expectedWorkHours: issue.expected_work_hours || 0,
            actualWorkHours: issue.actual_work_hours || 0,
            parentIssue: issue.parent_issue
              ? {
                  issueId: issue.parent_issue.id,
                  subject: issue.parent_issue.subject,
                }
              : undefined,
            projectId: issue.project?.identifier,
          })) || []

        const simplifiedResponse = {
          issues: simplifiedIssues,
          total: result.total || 0,
          count: simplifiedIssues.length,
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(simplifiedResponse, null, 2),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error searching issues: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    },
  )
}
