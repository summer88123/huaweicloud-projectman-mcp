# huaweicloud-projectman-mcp

A Model Context Protocol (MCP) server for HuaweiCloud ProjectMan integration, enabling AI assistants to interact with ProjectMan issues and work hours.

## Features

### Tools

#### addIssueWorkHours

Add work hour records to ProjectMan issues with comprehensive validation.

**Parameters:**

- `issueId` (number, required): The ID of the issue to add work hours to
- `workHoursTypeId` (number, required): Type of work performed (21-34)
- `workHours` (number, required): Number of hours worked (supports decimals, e.g., 2.5)
- `startDate` (string, required): Start date in YYYY-MM-DD format
- `dueDate` (string, required): End date in YYYY-MM-DD format

**Work Hour Types:**

- 21: 研发设计 (Design)
- 22: 后端开发 (Backend Development)
- 23: 前端开发(Web) (Web Frontend)
- 24: 前端开发(小程序) (Mini Program)
- 25: 前端开发(App) (App Development)
- 26: 测试验证 (Testing)
- 27: 缺陷修复 (Bug Fixing)
- 28: UI设计 (UI Design)
- 29: 会议 (Meetings)
- 30: 公共事务 (Administrative)
- 31: 培训 (Training)
- 32: 研究 (Research)
- 33: 其它 (Other)
- 34: 调休请假 (Time Off)

**Example:**

```json
{
  "issueId": 12345,
  "workHoursTypeId": 22,
  "workHours": 2.5,
  "startDate": "2025-11-08",
  "dueDate": "2025-11-10"
}
```

**Validation:**

- Issue ID must be a positive integer
- Work hour type ID must be between 21 and 34
- Work hours must be greater than zero
- Dates must be in YYYY-MM-DD format
- Start date must not be after due date

## Configuration

Set the following environment variables:

- `HUAWEICLOUD_SDK_AK`: Access Key ID
- `HUAWEICLOUD_SDK_SK`: Secret Access Key
- `HUAWEICLOUD_SDK_PROJECT_ID`: ProjectMan project ID (32-character hex string)
- `HUAWEICLOUD_SDK_REGION` (optional): Region identifier (default: cn-north-1)
- `HUAWEICLOUD_SDK_ENDPOINT` (optional): Custom endpoint URL

## Installation

```bash
npm install
npm run build
```

## Usage

Run as an MCP server:

```bash
npm run dev:stdio
```

## Development

```bash
# Run tests
npm test

# Run with coverage
npm run coverage

# Lint code
npm run lint

# Build for production
npm run build
```

## License

MIT
