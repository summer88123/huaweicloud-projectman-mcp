# huaweicloud-projectman-mcp

华为云 ProjectMan 的模型上下文协议（MCP）服务器，使 AI 助手能够与 ProjectMan 的数据进行交互。

## 配置

设置以下环境变量：

- `HUAWEICLOUD_SDK_AK`：访问密钥 ID
- `HUAWEICLOUD_SDK_SK`：秘密访问密钥
- `HUAWEICLOUD_SDK_PROJECT_ID`：IAM 项目 ID，与 REGION 关联
- `HUAWEICLOUD_SDK_REGION`（可选）：区域标识符（默认：cn-north-1）
- `HUAWEICLOUD_SDK_ENDPOINT`（可选）：自定义端点 URL

AK/SK 和 Project ID 可从华为云控制台的【我的凭证】中获取。

参考文档：[我的凭证](https://support.huaweicloud.com/usermanual-ca/ca_05_0003.html)

进入【我的凭证】页面后，选择【访问密钥】，即可查看或创建 AK/SK。选择【API凭证】，即可查看 Region 和对应的 Project ID。

## 使用

将以下配置添加到你的 MCP 客户端配置文件中（例如 Claude Desktop 的 `claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "projectman": {
      "command": "npx",
      "args": ["huaweicloud-projectman-mcp"],
      "env": {
        "HUAWEICLOUD_SDK_AK": "your-access-key-id",
        "HUAWEICLOUD_SDK_SK": "your-secret-access-key",
        "HUAWEICLOUD_SDK_PROJECT_ID": "your-32-char-project-id",
        "HUAWEICLOUD_SDK_REGION": "cn-north-1",
        "HUAWEICLOUD_SDK_ENDPOINT": "https://projectman.cn-north-1.myhuaweicloud.com"
      }
    }
  }
}
```

**注意：** 请将配置中的占位符替换为你的实际凭证信息。

## 开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 生产环境构建
npm run build
```

## License

MIT
