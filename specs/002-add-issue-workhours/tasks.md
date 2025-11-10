# Tasks: Add Issue Work Hours

**Input**: Design documents from `/specs/002-add-issue-workhours/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Date**: 2025-11-10

**Tests**: No test tasks included (not explicitly requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: `src/`, `tests/` at repository root
- Following existing MCP server patterns

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - no setup required, using existing MCP server structure

✅ **SKIPPED**: Project structure already exists from feature 001-projectman-client-init

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Add work hour type constants to src/constants/index.ts (14 predefined types: 21-34)
- [x] T002 [P] Create Zod input schema in src/tools/addIssueWorkHours.ts with date range validation

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Record Basic Work Hours (Priority: P1) 🎯 MVP

**Goal**: Enable developers to record work hours by providing issue ID, work hours, work hour type, and date range. System validates input and submits to ProjectMan API.

**Independent Test**: Provide valid issue ID, work hours (e.g., 2.5), work hour type (e.g., 22 for backend development), and date range. Verify system returns success response and work hour is recorded in ProjectMan.

### Implementation for User Story 1

- [x] T003 [US1] Implement addIssueWorkHours tool registration in src/tools/addIssueWorkHours.ts
- [x] T004 [US1] Implement tool handler to call ProjectManClient.addIssueWorkHours() in src/tools/addIssueWorkHours.ts
- [x] T005 [US1] Add error handling for API failures in src/tools/addIssueWorkHours.ts
- [x] T006 [US1] Export addIssueWorkHours tool registration from src/tools/index.ts
- [x] T007 [US1] Verify issueId validation (required, positive integer) in Zod schema

**Checkpoint**: User Story 1 complete - tool can add work hours with all required parameters

---

## Phase 4: User Story 2 - Select Work Hour Type from Predefined List (Priority: P2)

**Goal**: Users can select work hour type from predefined list (14 types). System displays clear type names and validates type ID range (21-34).

**Independent Test**: Request work hour types list, verify all 14 types with names are available. Submit with type ID 22, verify it's accepted. Submit with type ID 99, verify validation error.

### Implementation for User Story 2

- [x] T008 [P] [US2] Add work hour type descriptions to constants in src/constants/index.ts
- [x] T009 [US2] Update Zod schema to include work hour type descriptions in src/tools/addIssueWorkHours.ts
- [x] T010 [US2] Add tool description documenting all 14 work hour types in src/tools/addIssueWorkHours.ts

**Checkpoint**: User Story 2 complete - work hour types are clearly documented and validated

---

## Phase 5: User Story 3 - Validate Date Range (Priority: P2)

**Goal**: System validates date format (YYYY-MM-DD) and logical validity (start date not after due date), ensuring data accuracy before submission.

**Independent Test**: Submit with start date after due date, verify error. Submit with invalid date format, verify error. Submit with valid date range, verify acceptance.

### Implementation for User Story 3

- [x] T011 [US3] Add date format validation (YYYY-MM-DD regex) in Zod schema in src/tools/addIssueWorkHours.ts
- [x] T012 [US3] Add date range cross-field validation (startDate <= dueDate) using Zod refine in src/tools/addIssueWorkHours.ts
- [x] T013 [US3] Ensure validation error messages are specific and actionable in src/tools/addIssueWorkHours.ts

**Checkpoint**: User Story 3 complete - date validation prevents invalid date submissions

---

## Phase 6: User Story 4 - Handle Configuration Errors (Priority: P3)

**Goal**: When configuration is missing (project ID, AK/SK), system provides clear error messages guiding users to complete necessary configuration.

**Independent Test**: Remove environment variables, attempt to add work hours, verify clear configuration error messages are displayed.

### Implementation for User Story 4

- [x] T014 [US4] Add configuration validation check before API call in src/tools/addIssueWorkHours.ts
- [x] T015 [US4] Add specific error messages for missing projectId in src/tools/addIssueWorkHours.ts
- [x] T016 [US4] Add specific error messages for authentication failures in src/tools/addIssueWorkHours.ts

**Checkpoint**: User Story 4 complete - configuration errors provide helpful guidance

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T017 [P] Add addIssueWorkHours tool to main tool registration in src/index.ts
- [x] T018 [P] Verify all error messages follow MCP protocol standards
- [x] T019 [P] Update README.md with addIssueWorkHours tool documentation
- [x] T020 [P] Add usage examples to src/projectman/addIssueWorkHour.md
- [x] T021 Run manual tests following quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ SKIPPED - structure exists
- **Foundational (Phase 2)**: Can start immediately - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P2 → P3)
  - Some tasks within stories can run in parallel
- **Polish (Phase 7)**: Depends on User Story 1 (MVP) minimum, ideally all stories

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Builds on US1 (enhances type selection) - extends same file
- **User Story 3 (P2)**: Builds on US1 (adds validation) - extends same file
- **User Story 4 (P3)**: Builds on US1 (adds error handling) - extends same file

### Within Each User Story

**User Story 1**:

1. T003 (tool registration) first
2. T004 (handler implementation) depends on T003
3. T005 (error handling) depends on T004
4. T006 (export) depends on T003
5. T007 (validation) can be done in parallel with T003-T005

**User Story 2**: All tasks extend work done in US1

**User Story 3**: T011 and T012 can be done together, T013 verifies both

**User Story 4**: T014-T016 are sequential enhancements

### Parallel Opportunities

**Phase 2 (Foundational)**:

- T001 and T002 can run in parallel (different concerns)

**Phase 3 (User Story 1)**:

- T007 can run in parallel with T003-T005 (different focus)

**Phase 7 (Polish)**:

- T017, T018, T019, T020 can all run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch foundational tasks together:
Task: "Add work hour type constants to src/constants/index.ts"
Task: "Create Zod input schema in src/tools/addIssueWorkHours.ts"

# Then implement core functionality:
Task: "Implement addIssueWorkHours tool registration"
# followed by handler, error handling, export, validation
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T002)
2. Complete Phase 3: User Story 1 (T003-T007)
3. Complete Phase 7: Essential Polish (T017, T021)
4. **STOP and VALIDATE**: Test with quickstart.md scenarios
5. Deploy/demo if ready

**MVP Scope**: 7 implementation tasks + 2 polish tasks = ~2-3 hours of work

### Incremental Delivery

1. Complete Foundational → Constants and schema ready
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)**
3. Add User Story 2 → Enhanced type selection → Deploy/Demo
4. Add User Story 3 → Date validation → Deploy/Demo
5. Add User Story 4 → Better error messages → Deploy/Demo
6. Each story adds value without breaking previous stories

### Full Feature Strategy

With single developer (sequential):

1. Phase 2: Foundational (30 min)
2. Phase 3: User Story 1 (1-1.5 hours)
3. Phase 4: User Story 2 (30 min)
4. Phase 5: User Story 3 (30 min)
5. Phase 6: User Story 4 (45 min)
6. Phase 7: Polish (45 min)

**Total**: ~4-5 hours for complete feature

---

## Notes

- [P] tasks = different files or independent concerns, can run in parallel
- [Story] label maps task to specific user story from spec.md
- Each user story enhances the core functionality incrementally
- All implementation in single file (src/tools/addIssueWorkHours.ts) means limited parallelization
- Constitution VI compliance: Parameter forwarding only, no business logic
- Validation is input checking, not business rules (work hour types are SDK constants)
- Commit after each user story phase
- Stop at any checkpoint to validate story independently

---

## Validation Checklist

- ✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- ✅ Tasks organized by user story (US1-US4)
- ✅ Each user story has clear goal and independent test criteria
- ✅ Dependencies clearly documented
- ✅ Parallel opportunities identified with [P] marker
- ✅ MVP scope identified (User Story 1)
- ✅ File paths included in all implementation tasks
- ✅ No test tasks (not requested in specification)
- ✅ Total task count: 21 tasks (2 foundational + 5 US1 + 3 US2 + 3 US3 + 3 US4 + 5 polish)
