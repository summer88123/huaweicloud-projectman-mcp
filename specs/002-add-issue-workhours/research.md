# Research: Add Issue Work Hours Tool

**Feature**: Add Issue Work Hours  
**Date**: 2025-11-10  
**Purpose**: Resolve technical unknowns and document decisions for implementing the addIssueWorkHours MCP tool

## Research Questions

### 1. HuaweiCloud ProjectMan SDK API Contract

**Question**: What are the exact parameter types, required fields, and response format for `addIssueWorkHours` API?

**Decision**: Use the following API contract based on SDK documentation and example code:

```typescript
// Request parameters
interface AddIssueWorkHoursRequest {
  projectId: string // Required: 32-char hex project ID
  issueId: number // Required: Issue ID (integer)
  body: {
    workHoursTypeId: number // Required: 21-34 (predefined types)
    workHours: number // Required: Positive number (hours)
    startDate: string // Required: YYYY-MM-DD format
    dueDate: string // Required: YYYY-MM-DD format
  }
}

// Response (on success)
{
  // SDK returns success response, exact structure TBD from SDK types
  // Will be forwarded as-is to MCP client
}
```

**Rationale**:

- Example code in `src/projectman/addIssueWorkHour.md` shows these exact parameters
- SDK is already installed (@huaweicloud/huaweicloud-sdk-projectman v3.1.174)
- Follows existing pattern: projectId from config, user-provided parameters via MCP tool input

**Alternatives Considered**:

- ❌ Reading SDK source code - unnecessary, example code is authoritative
- ❌ Making test API calls - should be done in unit tests, not research phase

---

### 2. Work Hour Type Constants

**Question**: Should work hour types be hardcoded constants or configurable?

**Decision**: Define as read-only constants in `src/constants/index.ts`:

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

**Rationale**:

- These are ProjectMan SDK's domain constants, not our business rules (Constitution VI compliant)
- Hardcoding prevents misconfiguration and provides type safety
- LLMs can reference these constants for user-friendly type selection
- Follows TypeScript best practices for enum-like constants

**Alternatives Considered**:

- ❌ Configurable via environment variables - adds complexity, types are fixed by SDK
- ❌ Fetching from API - unnecessary network call, types are stable
- ✅ Could add MCP resource to list types for LLM discovery (future enhancement)

---

### 3. Input Validation Strategy

**Question**: What validation should be performed before forwarding to SDK?

**Decision**: Implement Zod schema with these validations:

```typescript
const AddIssueWorkHoursInputSchema = z
  .object({
    issueId: z.number().int().positive().describe('Issue ID to add work hours to'),
    workHoursTypeId: z.number().int().min(21).max(34).describe('Work hour type (21-34)'),
    workHours: z.number().positive().describe('Work hours (must be positive)'),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe('Start date (YYYY-MM-DD)'),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe('End date (YYYY-MM-DD)'),
  })
  .refine(data => new Date(data.startDate) <= new Date(data.dueDate), {
    message: 'Start date must not be after due date',
  })
```

**Rationale**:

- Type checking (number, string) catches basic errors before API call
- Range validation (21-34) ensures valid work hour type
- Date format validation prevents API errors
- Date logic validation (start <= due) improves UX
- Follows existing pattern in `src/projectman/validation.ts`
- **NOT business logic** - these are input sanitization checks (Constitution VI compliant)

**Alternatives Considered**:

- ❌ No validation - poor UX, wastes API calls on invalid input
- ❌ Complex validation (e.g., max 24 hours/day) - that's business logic, violates Constitution VI
- ✅ Current approach: validate types and formats only

---

### 4. Error Handling Pattern

**Question**: How should errors be returned to MCP client?

**Decision**: Follow existing MCP tool pattern:

```typescript
// On success
return {
  content: [
    {
      type: 'text',
      text: JSON.stringify(result),
    },
  ],
}

// On validation error (caught by Zod)
// MCP SDK handles automatically, returns error to client

// On API error
return {
  content: [
    {
      type: 'text',
      text: `Error adding work hours: ${error.message}`,
    },
  ],
  isError: true,
}
```

**Rationale**:

- Matches existing tool pattern in `src/tools/registerGetData.ts`
- MCP SDK automatically handles Zod validation errors
- SDK errors caught and forwarded with context
- No credential leakage (Constitution V compliant)

**Alternatives Considered**:

- ❌ Structured error codes - adds complexity, MCP clients prefer text messages
- ❌ Logging errors - credentials might leak (Constitution V violation)

---

### 5. Testing Strategy

**Question**: What test coverage is needed for >80% requirement?

**Decision**: Implement these test cases in `tests/tools/addIssueWorkHours.test.ts`:

**Unit Tests** (high priority):

1. ✅ Valid input → successful API call
2. ✅ Missing required field → validation error
3. ✅ Invalid issueId (negative, zero, non-integer) → validation error
4. ✅ Invalid workHoursTypeId (out of range 21-34) → validation error
5. ✅ Invalid workHours (negative, zero) → validation error
6. ✅ Invalid date format → validation error
7. ✅ Start date after due date → validation error
8. ✅ SDK throws error → error returned to MCP client
9. ✅ All 14 work hour types accepted

**Integration Tests** (optional, for >80% coverage):

- Mock ProjectMan SDK client
- Verify request shape matches SDK expectations
- Verify response forwarding

**Rationale**:

- Constitution III requires tests before implementation
- 9 core test cases should achieve >80% coverage
- Mocking SDK prevents real API calls in tests
- Follows existing test patterns in `tests/`

**Alternatives Considered**:

- ❌ Real API integration tests - requires credentials, slow, brittle
- ❌ Testing business logic - we have none (Constitution VI)

---

## Best Practices Applied

### Zod Schema Documentation

- Use `.describe()` for each field to generate MCP tool input schema descriptions
- Helps LLMs understand parameter purpose and format

### TypeScript Type Safety

- Leverage `as const` for work hour type constants
- Use `keyof typeof` for type-safe ID validation
- Import SDK types where available

### MCP Tool Registration Pattern

```typescript
server.registerTool(
  'addIssueWorkHours',
  {
    title: 'Add Issue Work Hours',
    description: 'Add work hour record to a ProjectMan issue',
    inputSchema: AddIssueWorkHoursInputSchema,
  },
  async input => {
    // Implementation
  },
)
```

### Constitution Compliance Checklist

- ✅ Type-safe configuration (reuse existing projectId validation)
- ✅ MCP protocol compliance (standard registerTool pattern)
- ✅ Test-first development (tests before implementation)
- ✅ Single responsibility (tool only forwards parameters)
- ✅ Security (no credential logging)
- ✅ Parameter forwarding focus (no business logic)

---

## Dependencies Analysis

### Existing Dependencies (no changes needed)

- `@huaweicloud/huaweicloud-sdk-projectman` v3.1.174 - provides `addIssueWorkHours` API
- `@modelcontextprotocol/sdk` v1.20.2 - provides MCP server and tool registration
- `zod` v3.25.76 - provides input validation
- `vitest` v4.0.5 - provides testing framework

### No New Dependencies Required

All functionality achievable with existing packages.

---

## Performance Considerations

**Expected Performance**:

- Input validation: <1ms (Zod schema check)
- API call: 500ms-2000ms (network + HuaweiCloud processing)
- Total tool execution: <2 seconds (meets Technical Context goal)

**No Optimization Needed**:

- Single API call per tool invocation
- Stateless operation (no caching needed)
- Validation is fast enough for interactive use

---

## Summary

All technical unknowns resolved. Implementation can proceed with:

1. Work hour type constants in `src/constants/index.ts`
2. Zod validation schema with type/format checks only
3. Tool registration following existing pattern
4. 9+ unit tests for >80% coverage
5. No new dependencies required

**Ready for Phase 1: Design & Contracts**
