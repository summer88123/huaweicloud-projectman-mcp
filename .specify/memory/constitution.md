<!--
Sync Impact Report - Constitution v1.0.0
═══════════════════════════════════════════════════════════════════
Version Change: Initial → 1.0.0
Rationale: First constitution ratification for HuaweiCloud ProjectMan MCP project

Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (5 principles defined)
  - MCP Protocol Compliance
  - Development Workflow
  - Governance

Removed Sections: N/A

Templates Status:
  ✅ spec-template.md - Reviewed, compatible with constitution
  ✅ plan-template.md - Reviewed, compatible with constitution
  ✅ tasks-template.md - Reviewed, compatible with constitution
  ⚠ checklist-template.md - Not reviewed (requires manual check)
  ⚠ agent-file-template.md - Not reviewed (requires manual check)

Follow-up TODOs: None
═══════════════════════════════════════════════════════════════════
-->

# HuaweiCloud ProjectMan MCP Constitution

## Core Principles

### I. Type-Safe Configuration

**MUST**: All configuration parameters (AK, SK, project_id, region, endpoint) MUST be defined with TypeScript types in `types/global.ts`.

**MUST**: Runtime validation MUST be performed for all required configuration fields before client initialization.

**MUST**: Configuration errors MUST provide specific, actionable error messages indicating which fields are missing or invalid.

**Rationale**: Type safety catches configuration errors at compile time, reducing runtime failures. Clear error messages accelerate troubleshooting in production environments where credentials may be misconfigured.

### II. MCP Protocol Compliance (NON-NEGOTIABLE)

**MUST**: All tool implementations MUST strictly adhere to Model Context Protocol specification.

**MUST**: Tools MUST accept input via stdio and return JSON-formatted responses.

**MUST**: Resources and prompts MUST follow MCP resource/prompt schema definitions.

**MUST NOT**: Deviate from MCP SDK patterns without explicit architectural justification.

**Rationale**: MCP protocol compliance ensures interoperability with all MCP clients (Claude Desktop, IDEs, etc.). Breaking protocol contracts renders the server unusable.

### III. Test-First Development

**MUST**: Unit tests MUST be written before implementation for all new features.

**MUST**: Tests MUST fail initially (Red), then pass after implementation (Green), followed by refactoring.

**SHOULD**: Integration tests SHOULD cover client initialization, API contract validation, and error scenarios.

**MUST**: Code coverage for core modules (`src/projectman/`, `src/tools/`, `src/resources/`) MUST exceed 80%.

**Rationale**: TDD ensures requirements are clear before coding begins. High coverage prevents regressions in critical authentication and API communication paths.

### IV. Single Responsibility & Modularity

**MUST**: Each module MUST have a single, well-defined responsibility:

- `projectman/`: Client initialization and credential management only
- `tools/`: MCP tool implementations only
- `resources/`: MCP resource providers only
- `prompts/`: MCP prompt templates only
- `services/`: Transport layer (stdio/SSE) only
- `utils/`: Pure utility functions only

**MUST NOT**: Mix concerns across module boundaries (e.g., tool logic in client module).

**Rationale**: Clear separation enables independent testing, parallel development, and easier debugging. Violation creates tight coupling and merge conflicts.

### V. Security & Credential Handling

**MUST**: Credentials (AK/SK) MUST NEVER be logged, printed to stdout, or included in error messages.

**MUST**: Credentials MUST be loaded from environment variables or secure configuration files only.

**MUST**: Client instances with cached credentials MUST validate configuration consistency before reuse.

**MUST**: Sensitive data in memory SHOULD be cleared when no longer needed.

**Rationale**: Credential leaks are critical security vulnerabilities. Huawei Cloud IAM violations can lead to account compromise and regulatory penalties.

## MCP Protocol Compliance

**Server Metadata**: MUST declare accurate server name, version, and capabilities in server info response.

**Tool Schemas**: MUST define Zod schemas for all tool inputs with comprehensive validation rules.

**Error Handling**: MUST return MCP-compliant error responses with error codes, messages, and optional details.

**Resource URIs**: MUST follow `huaweicloud-projectman://[resource-type]/[identifier]` convention.

**Stdio Transport**: MUST use `@modelcontextprotocol/sdk` stdio server implementation without modifications.

## Development Workflow

**Branching**: Feature branches MUST follow `###-feature-name` pattern (e.g., `001-projectman-client-init`).

**Specification**: All features MUST have a spec in `/specs/[###-feature-name]/spec.md` with user stories, requirements, and success criteria before implementation.

**Code Review**: All PRs MUST pass:

- TypeScript compilation with no errors
- ESLint checks with no violations
- Vitest unit tests with >80% coverage for new code
- Manual verification of MCP protocol compliance

**Commit Messages**: MUST follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `test:`, etc.).

## Governance

This Constitution supersedes all other development practices and preferences. Any deviation MUST be explicitly justified in PR description or architectural decision record.

**Amendments**: Constitution changes require:

1. Proposal with rationale and impact analysis
2. Update to all affected templates in `.specify/templates/`
3. Version bump following semantic versioning
4. Sync Impact Report documenting changes

**Versioning Policy**:

- MAJOR: Removal or incompatible changes to core principles
- MINOR: Addition of new principles or significant expansions
- PATCH: Clarifications, wording improvements, non-semantic fixes

**Compliance Review**: Each PR MUST verify alignment with applicable principles. Constitution violations block merge unless explicitly approved with justification.

**Runtime Guidance**: Development agents SHOULD reference this constitution when making architectural decisions. For feature-specific guidance, consult `/specs/` documentation.

**Version**: 1.0.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
