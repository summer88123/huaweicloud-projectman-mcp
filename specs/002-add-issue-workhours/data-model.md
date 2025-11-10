# Data Model: Add Issue Work Hours

**Feature**: Add Issue Work Hours  
**Date**: 2025-11-10  
**Purpose**: Define data structures and validation rules for the addIssueWorkHours tool

## Overview

This feature involves **parameter forwarding only** - no persistent data storage or complex domain modeling. The data model describes the input parameters that flow through the MCP tool to the ProjectMan SDK.

## Entities

### 1. Work Hour Entry (Input Parameter Object)

Represents a single work hour record to be added to an issue. This is a **transient data structure** that exists only during tool execution.

**Fields**:

| Field Name        | Type     | Constraints                     | Description                                              |
| ----------------- | -------- | ------------------------------- | -------------------------------------------------------- |
| `issueId`         | `number` | Required, integer, positive     | The ID of the issue to add work hours to                 |
| `workHoursTypeId` | `number` | Required, integer, range: 21-34 | The type of work performed (see Work Hour Types below)   |
| `workHours`       | `number` | Required, positive              | Number of hours worked (can include decimals, e.g., 0.5) |
| `startDate`       | `string` | Required, format: YYYY-MM-DD    | Start date of the work period                            |
| `dueDate`         | `string` | Required, format: YYYY-MM-DD    | End date of the work period (must be >= startDate)       |

**Validation Rules**:

1. `issueId` must be a positive integer
2. `workHoursTypeId` must be one of the predefined type IDs (21-34)
3. `workHours` must be greater than zero
4. `startDate` and `dueDate` must match ISO date format (YYYY-MM-DD)
5. `startDate` must not be after `dueDate`

**Example**:

```json
{
  "issueId": 12345,
  "workHoursTypeId": 22,
  "workHours": 2.5,
  "startDate": "2025-11-08",
  "dueDate": "2025-11-10"
}
```

---

### 2. Work Hour Type (Constants)

Predefined work classification types defined by the ProjectMan SDK. These are **read-only constants**, not mutable domain objects.

**Structure**:

| Type ID | Type Name (Chinese) | Category          |
| ------- | ------------------- | ----------------- |
| 21      | 研发设计            | Development       |
| 22      | 后端开发            | Development       |
| 23      | 前端开发(Web)       | Development       |
| 24      | 前端开发(小程序)    | Development       |
| 25      | 前端开发(App)       | Development       |
| 26      | 测试验证            | Quality Assurance |
| 27      | 缺陷修复            | Maintenance       |
| 28      | UI设计              | Design            |
| 29      | 会议                | Management        |
| 30      | 公共事务            | Administrative    |
| 31      | 培训                | Learning          |
| 32      | 研究                | Research          |
| 33      | 其它                | Other             |
| 34      | 调休请假            | Time Off          |

**Usage**: These constants are used to validate `workHoursTypeId` input and provide human-readable descriptions to LLM clients.

**TypeScript Representation**:

```typescript
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

### 3. Project Context (Configuration)

Project identification is provided through **existing configuration**, not tool input. This maintains separation of concerns (tool inputs vs. server configuration).

**Fields**:

| Field Name  | Type     | Source                              | Description                                                 |
| ----------- | -------- | ----------------------------------- | ----------------------------------------------------------- |
| `projectId` | `string` | Environment variable or config file | 32-character hex string identifying the HuaweiCloud project |

**Validation**: Already implemented in `src/projectman/validation.ts`:

- Must be 32 characters
- Must be lowercase hexadecimal ([a-f0-9])

**Note**: This is NOT part of the tool's input schema - it's injected from server configuration.

---

## Data Flow

```
┌─────────────────┐
│  MCP Client     │
│  (LLM/IDE)      │
└────────┬────────┘
         │ Provides: issueId, workHoursTypeId, workHours, startDate, dueDate
         ▼
┌─────────────────────────────────┐
│  addIssueWorkHours MCP Tool     │
│  ┌──────────────────────────┐   │
│  │ 1. Zod Validation        │   │
│  │    - Type checking       │   │
│  │    - Range validation    │   │
│  │    - Date validation     │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 2. Build SDK Request     │   │
│  │    - projectId from cfg  │   │
│  │    - issueId from input  │   │
│  │    - body from input     │   │
│  └──────────────────────────┘   │
└────────┬────────────────────────┘
         │ AddIssueWorkHoursRequest
         ▼
┌─────────────────────────────────┐
│  HuaweiCloud ProjectMan SDK     │
│  client.addIssueWorkHours()     │
└────────┬────────────────────────┘
         │ HTTP POST to ProjectMan API
         ▼
┌─────────────────────────────────┐
│  HuaweiCloud ProjectMan Service │
│  (Remote API)                   │
└────────┬────────────────────────┘
         │ Response (success or error)
         ▼
┌─────────────────────────────────┐
│  MCP Tool Response              │
│  - Success: JSON stringified    │
│  - Error: Error message         │
└─────────────────────────────────┘
```

---

## State Transitions

**None**. This tool is stateless:

- No state is maintained between invocations
- No local persistence or caching
- Each invocation is independent
- No workflow or approval states

**Idempotency**: The tool itself is stateless, but repeated calls with the same parameters will create multiple work hour records in ProjectMan (backend behavior, not our concern per Constitution VI).

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────────────┐
│  Project            │
│  (from config)      │
│  - projectId        │
└──────────┬──────────┘
           │
           │ contains
           ▼
┌─────────────────────┐
│  Issue              │
│  (external entity)  │
│  - issueId          │
└──────────┬──────────┘
           │
           │ has many
           ▼
┌─────────────────────┐       ┌──────────────────────┐
│  Work Hour Entry    │──────>│  Work Hour Type      │
│  (input params)     │ uses  │  (constant)          │
│  - issueId          │       │  - workHoursTypeId   │
│  - workHoursTypeId  │       │  - type name         │
│  - workHours        │       └──────────────────────┘
│  - startDate        │
│  - dueDate          │
└─────────────────────┘
```

**Notes**:

- `Project` and `Issue` are external entities managed by ProjectMan
- `Work Hour Entry` is a transient input structure, not persisted by our tool
- `Work Hour Type` is a read-only constant set

---

## TypeScript Type Definitions

### Input Schema (Zod)

```typescript
import { z } from 'zod'

export const AddIssueWorkHoursInputSchema = z
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

export type AddIssueWorkHoursInput = z.infer<typeof AddIssueWorkHoursInputSchema>
```

### Constants

```typescript
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

## Summary

**Key Characteristics**:

- ✅ Stateless (no persistence)
- ✅ Parameter forwarding only (no business logic)
- ✅ Type-safe (Zod validation + TypeScript types)
- ✅ Constitution VI compliant (no domain modeling beyond SDK contract)

**No Complex Domain Modeling**: This is an MCP adapter, not a domain application. The "data model" is simply the input validation rules and constant definitions required to safely forward parameters to the ProjectMan SDK.
