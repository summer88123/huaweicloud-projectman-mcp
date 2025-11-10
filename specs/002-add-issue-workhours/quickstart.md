# Quickstart: Add Issue Work Hours Tool

**Feature**: Add Issue Work Hours  
**Date**: 2025-11-10  
**Purpose**: Quick reference guide for implementing and using the addIssueWorkHours MCP tool

## Prerequisites

- ✅ HuaweiCloud ProjectMan MCP server is configured (AK, SK, project_id)
- ✅ User has permission to add work hours to issues in the target project
- ✅ User knows the issue ID they want to add work hours to

## Implementation Steps

### 1. Add Work Hour Type Constants (5 minutes)

**File**: `src/constants/index.ts`

```typescript
// Add work hour type constants
export const WORK_HOUR_TYPES = {
  21: '研发设计',
  22: '后端开发',
  23: '前端开发(Web)',
  24: '前端开发(小程序)',
  25: '前端开发(App)',
  26: '测试验证',
  27: '缺陷修复',
  28: 'UI设计',
  29: '会议',
  30: '公共事务',
  31: '培训',
  32: '研究',
  33: '其它',
  34: '调休请假',
} as const

export type WorkHourTypeId = keyof typeof WORK_HOUR_TYPES
```

---

### 2. Create Tool Implementation (15 minutes)

**File**: `src/tools/addIssueWorkHours.ts`

```typescript
import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { OptionsType } from '@/types'
import { getProjectManClient } from '@/projectman/index.js'
import {
  AddIssueWorkHoursRequest,
  AddIssueWorkHoursRequestBody,
} from '@huaweicloud/huaweicloud-sdk-projectman/v4/public-api'

// Input validation schema
const AddIssueWorkHoursInputSchema = z
  .object({
    issueId: z
      .number()
      .int('Issue ID must be an integer')
      .positive('Issue ID must be positive')
      .describe('The ID of the issue to add work hours to'),

    workHoursTypeId: z
      .number()
      .int('Work hour type ID must be an integer')
      .min(21, 'Work hour type ID must be between 21 and 34')
      .max(34, 'Work hour type ID must be between 21 and 34')
      .describe('Type of work performed (21-34)'),

    workHours: z.number().positive('Work hours must be greater than zero').describe('Number of hours worked'),

    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .describe('Start date of the work period (YYYY-MM-DD)'),

    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
      .describe('End date of the work period (YYYY-MM-DD)'),
  })
  .refine(data => new Date(data.startDate) <= new Date(data.dueDate), {
    message: 'Start date must not be after due date',
    path: ['startDate'],
  })

export default function register(server: McpServer, options: OptionsType) {
  server.registerTool(
    'addIssueWorkHours',
    {
      title: 'Add Issue Work Hours',
      description: 'Add work hour record to a HuaweiCloud ProjectMan issue',
      inputSchema: AddIssueWorkHoursInputSchema,
    },
    async ({ issueId, workHoursTypeId, workHours, startDate, dueDate }) => {
      try {
        const client = getProjectManClient(options)

        const request = new AddIssueWorkHoursRequest()
        request.projectId = options.project_id
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
              text: JSON.stringify(result),
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
```

---

### 3. Register Tool in Tool Index (2 minutes)

**File**: `src/tools/index.ts`

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { OptionsType } from '@/types'
import registerGetData from './registerGetData.js'
import registerAddIssueWorkHours from './addIssueWorkHours.js' // ADD THIS

export function registerTools(server: McpServer, options: OptionsType) {
  registerGetData(server, options)
  registerAddIssueWorkHours(server, options) // ADD THIS
}
```

---

### 4. Write Unit Tests (20 minutes)

**File**: `tests/tools/addIssueWorkHours.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { AddIssueWorkHoursInputSchema } from '@/tools/addIssueWorkHours'

describe('addIssueWorkHours validation', () => {
  it('should accept valid input', () => {
    const validInput = {
      issueId: 12345,
      workHoursTypeId: 22,
      workHours: 2.5,
      startDate: '2025-11-08',
      dueDate: '2025-11-10',
    }

    expect(() => AddIssueWorkHoursInputSchema.parse(validInput)).not.toThrow()
  })

  it('should reject negative issue ID', () => {
    const invalidInput = {
      issueId: -1,
      workHoursTypeId: 22,
      workHours: 2.5,
      startDate: '2025-11-08',
      dueDate: '2025-11-10',
    }

    expect(() => AddIssueWorkHoursInputSchema.parse(invalidInput)).toThrow()
  })

  it('should reject invalid work hour type ID', () => {
    const invalidInput = {
      issueId: 12345,
      workHoursTypeId: 99,
      workHours: 2.5,
      startDate: '2025-11-08',
      dueDate: '2025-11-10',
    }

    expect(() => AddIssueWorkHoursInputSchema.parse(invalidInput)).toThrow('between 21 and 34')
  })

  it('should reject negative work hours', () => {
    const invalidInput = {
      issueId: 12345,
      workHoursTypeId: 22,
      workHours: -1,
      startDate: '2025-11-08',
      dueDate: '2025-11-10',
    }

    expect(() => AddIssueWorkHoursInputSchema.parse(invalidInput)).toThrow()
  })

  it('should reject invalid date format', () => {
    const invalidInput = {
      issueId: 12345,
      workHoursTypeId: 22,
      workHours: 2.5,
      startDate: '11/08/2025',
      dueDate: '2025-11-10',
    }

    expect(() => AddIssueWorkHoursInputSchema.parse(invalidInput)).toThrow('YYYY-MM-DD')
  })

  it('should reject start date after due date', () => {
    const invalidInput = {
      issueId: 12345,
      workHoursTypeId: 22,
      workHours: 2.5,
      startDate: '2025-11-10',
      dueDate: '2025-11-08',
    }

    expect(() => AddIssueWorkHoursInputSchema.parse(invalidInput)).toThrow('Start date must not be after due date')
  })

  it('should accept all valid work hour type IDs (21-34)', () => {
    for (let typeId = 21; typeId <= 34; typeId++) {
      const validInput = {
        issueId: 12345,
        workHoursTypeId: typeId,
        workHours: 2.5,
        startDate: '2025-11-08',
        dueDate: '2025-11-10',
      }

      expect(() => AddIssueWorkHoursInputSchema.parse(validInput)).not.toThrow()
    }
  })
})
```

---

### 5. Run Tests

```bash
npm test
```

Expected: All tests pass, coverage >80%

---

## Usage Examples

### Example 1: Add Backend Development Hours

**MCP Client Request**:

```json
{
  "tool": "addIssueWorkHours",
  "arguments": {
    "issueId": 12345,
    "workHoursTypeId": 22,
    "workHours": 2.5,
    "startDate": "2025-11-08",
    "dueDate": "2025-11-10"
  }
}
```

**Expected Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"workHourId\":\"abc123\",\"issueId\":12345,\"workHours\":2.5,\"workHoursTypeId\":22}"
    }
  ]
}
```

---

### Example 2: Add UI Design Hours

**MCP Client Request**:

```json
{
  "tool": "addIssueWorkHours",
  "arguments": {
    "issueId": 67890,
    "workHoursTypeId": 28,
    "workHours": 4,
    "startDate": "2025-11-09",
    "dueDate": "2025-11-09"
  }
}
```

---

### Example 3: Validation Error (Invalid Type)

**MCP Client Request**:

```json
{
  "tool": "addIssueWorkHours",
  "arguments": {
    "issueId": 12345,
    "workHoursTypeId": 99,
    "workHours": 2.5,
    "startDate": "2025-11-08",
    "dueDate": "2025-11-10"
  }
}
```

**Expected Error**:

```
Work hour type ID must be between 21 and 34
```

---

## Work Hour Type Reference

Quick reference for `workHoursTypeId` values:

| ID  | Type Name (Chinese) | When to Use              |
| --- | ------------------- | ------------------------ |
| 21  | 研发设计            | Research & Design work   |
| 22  | 后端开发            | Backend development      |
| 23  | 前端开发(Web)       | Web frontend development |
| 24  | 前端开发(小程序)    | Mini-program frontend    |
| 25  | 前端开发(App)       | Mobile app frontend      |
| 26  | 测试验证            | Testing & QA             |
| 27  | 缺陷修复            | Bug fixing               |
| 28  | UI设计              | UI/UX design             |
| 29  | 会议                | Meetings                 |
| 30  | 公共事务            | Administrative tasks     |
| 31  | 培训                | Training                 |
| 32  | 研究                | Research                 |
| 33  | 其它                | Other work               |
| 34  | 调休请假            | Time off / Leave         |

---

## Testing Checklist

- [ ] All 14 work hour types (21-34) are accepted
- [ ] Validation rejects invalid type IDs (<21 or >34)
- [ ] Validation rejects negative or zero work hours
- [ ] Validation rejects invalid date formats
- [ ] Validation rejects start date after due date
- [ ] Successful API call returns JSON response
- [ ] API errors are caught and returned with isError flag
- [ ] Code coverage >80%

---

## Troubleshooting

### "Issue ID must be positive"

- Ensure `issueId` is a positive integer
- Check that the issue exists in your ProjectMan project

### "Work hour type ID must be between 21 and 34"

- Use one of the predefined type IDs (see reference table above)
- Do not use arbitrary numbers

### "Start date must not be after due date"

- Verify `startDate` <= `dueDate`
- Use YYYY-MM-DD format for both dates

### "Error adding work hours: Issue not found"

- Verify the issue ID exists in your project
- Check that you have permission to add work hours to this issue

---

## Next Steps

After implementing this tool:

1. Run `/speckit.tasks` to generate implementation tasks
2. Follow TDD: write tests first, then implement
3. Test manually with MCP Inspector
4. Update `.github/copilot-instructions.md` if needed (via update-agent-context script)

**Estimated Total Implementation Time**: ~45 minutes
