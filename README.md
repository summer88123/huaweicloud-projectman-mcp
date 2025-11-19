# huaweicloud-projectman-mcp
华为云 ProjectMan 的模型上下文协议（MCP）服务器，使 AI 助手能够与 ProjectMan 的数据进行交互。

## 功能特性

### 工具

#### addIssueWorkHours

向 ProjectMan 工作项添加工时记录，具有全面的验证功能。

**参数：**

- `issueId`（数字，必填）：要添加工时的工作项 ID
- `workHoursTypeId`（数字，必填）：执行的工作类型（21-34）
- `workHours`（数字，必填）：工作小时数（支持小数，例如 2.5）
- `startDate`（字符串，必填）：开始日期，格式为 YYYY-MM-DD
- `dueDate`（字符串，必填）：结束日期，格式为 YYYY-MM-DD

**工时类型：**

- 21: 研发设计
- 22: 后端开发
- 23: 前端开发(Web)
- 24: 前端开发(小程序)
- 25: 前端开发(App)
- 26: 测试验证
- 27: 缺陷修复
- 28: UI设计
- 29: 会议
- 30: 公共事务
- 31: 培训
- 32: 研究
- 33: 其它
- 34: 调休请假

**示例：**

```json
{
  "issueId": 12345,
  "workHoursTypeId": 22,
  "workHours": 2.5,
  "startDate": "2025-11-08",
  "dueDate": "2025-11-10"
}
```

**验证规则：**

- 工作项 ID 必须是正整数
- 工时类型 ID 必须在 21 到 34 之间
- 工时数必须大于零
- 日期必须采用 YYYY-MM-DD 格式
- 开始日期不能晚于结束日期

## 配置

设置以下环境变量：

- `HUAWEICLOUD_SDK_AK`：访问密钥 ID
- `HUAWEICLOUD_SDK_SK`：秘密访问密钥
- `HUAWEICLOUD_SDK_PROJECT_ID`：IAM 项目 ID，与 REGION 关联
- `HUAWEICLOUD_SDK_REGION`（可选）：区域标识符（默认：cn-north-1）
- `HUAWEICLOUD_SDK_ENDPOINT`（可选）：自定义端点 URL

## 使用

将以下配置添加到你的 MCP 客户端配置文件中（例如 Claude Desktop 的 `claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "huaweicloud-projectman": {
      "command": "npx",
      "args": ["huaweicloud-projectman-mcp"],
      "env": {
        "HUAWEICLOUD_SDK_AK": "your-access-key-id",
        "HUAWEICLOUD_SDK_SK": "your-secret-access-key",
        "HUAWEICLOUD_SDK_PROJECT_ID": "your-32-char-project-id",
        "HUAWEICLOUD_SDK_REGION": "cn-north-1"
      }
    }
  }
}
```

**注意：** 请将配置中的占位符替换为你的实际凭证信息。

AK/SK 和 Project ID 可从华为云控制台的“我的凭证”中获取。

参考文档：[我的凭证](https://support.huaweicloud.com/usermanual-ca/ca_05_0003.html)

## 开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run coverage

# 代码检查
npm run lint

# 生产环境构建
npm run build
```

## License

MIT
