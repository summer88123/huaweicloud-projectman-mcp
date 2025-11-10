# Implementation Plan: Add Issue Work Hours

**Branch**: `002-add-issue-workhours` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-add-issue-workhours/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an MCP tool that enables users to add work hour records to HuaweiCloud ProjectMan system. The tool accepts issue ID, work hours, work hour type (from 14 predefined types), and date range as input parameters, validates the input, and forwards the request to the ProjectMan SDK's addIssueWorkHours API. This is a parameter forwarding tool following the MCP adapter pattern, with no business logic beyond input validation.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 18+  
**Primary Dependencies**: @huaweicloud/huaweicloud-sdk-projectman v3.1.174, @modelcontextprotocol/sdk v1.20.2, zod v3.25.76  
**Storage**: N/A (stateless MCP tool)  
**Testing**: Vitest v4.0.5 with >80% coverage requirement  
**Target Platform**: MCP server running on Node.js (cross-platform: Windows/Linux/macOS)  
**Project Type**: Single project (MCP server)  
**Performance Goals**: Tool response time <2 seconds for successful API calls, <100ms for validation errors  
**Constraints**: Must follow MCP protocol, must not implement business logic (parameter forwarding only per Constitution VI), must validate inputs before API call  
**Scale/Scope**: Single tool addition to existing MCP server, supporting 14 work hour types, expected usage <100 calls/day per user

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Type-Safe Configuration

- ✅ **PASS**: Configuration (project_id, AK, SK) already defined in types/global.ts
- ✅ **PASS**: Runtime validation exists in projectman/index.ts
- ⚠️ **ACTION REQUIRED**: Verify error messages for missing issueId parameter are specific and actionable

### II. MCP Protocol Compliance (NON-NEGOTIABLE)

- ✅ **PASS**: Tool will follow MCP SDK patterns (registerTool with Zod schema)
- ✅ **PASS**: Input via stdio, output as JSON (standard MCP tool pattern)
- ✅ **PASS**: No protocol deviations planned

### III. Test-First Development

- ⚠️ **ACTION REQUIRED**: Unit tests must be written BEFORE implementation
- ⚠️ **ACTION REQUIRED**: Coverage target >80% for src/tools/addIssueWorkHours.ts and related validation

### IV. Single Responsibility & Modularity

- ✅ **PASS**: Tool will be in src/tools/ following existing pattern
- ✅ **PASS**: Validation logic will be in src/projectman/validation.ts (existing pattern)
- ✅ **PASS**: No cross-module concern mixing

### V. Security & Credential Handling

- ✅ **PASS**: No new credential handling required (using existing projectman client)
- ✅ **PASS**: No logging of sensitive data

### VI. LLM-Friendly Parameter Forwarding Focus (NON-NEGOTIABLE)

- ✅ **PASS**: Tool forwards parameters to ProjectMan SDK without business logic
- ✅ **PASS**: Only input validation (type checking, range validation) - no workflow logic
- ✅ **PASS**: 14 work hour types are ProjectMan SDK's domain constants, not our business rules

**Gate Status**: ✅ **PASS** - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/002-add-issue-workhours/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── addIssueWorkHours.json  # OpenAPI/JSON schema for tool
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── tools/
│   ├── index.ts                    # Existing: Tool registry
│   ├── registerGetData.ts          # Existing: Example tool
│   └── addIssueWorkHours.ts        # NEW: Add issue work hours tool
├── projectman/
│   ├── index.ts                    # Existing: Client initialization
│   ├── types.ts                    # Existing: ProjectMan types
│   ├── validation.ts               # Existing: Validation utilities
│   └── addIssueWorkHour.md         # Existing: API example (reference doc)
├── types/
│   └── global.ts                   # Existing: Configuration types
└── constants/
    └── index.ts                    # Existing or NEW: Work hour type constants

tests/
├── tools/
│   └── addIssueWorkHours.test.ts   # NEW: Unit tests for the tool
└── projectman/
    └── validation.test.ts          # Existing: May need updates for new validators
```

**Structure Decision**: Single project structure (Option 1). This is an MCP server with a new tool registration. Following existing patterns:

- Tool implementation in `src/tools/addIssueWorkHours.ts` (matches `registerGetData.ts` pattern)
- Input validation in `src/projectman/validation.ts` (centralized validation)
- Work hour type constants in `src/constants/index.ts` (14 predefined types)
- Tests mirror source structure in `tests/tools/` and `tests/projectman/`

## Phase 0: Research & Technical Decisions

_Output: `research.md` with resolved technical unknowns_
