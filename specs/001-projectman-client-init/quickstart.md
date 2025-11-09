# Quick Start: 华为云ProjectMan客户端初始化

**Feature**: 001-projectman-client-init  
**Date**: 2025-11-09  
**For**: 开发者和系统管理员

## 概述

本指南帮助您快速配置和初始化华为云ProjectMan MCP服务器客户端。

## 前置要求

1. **华为云账号**: 拥有有效的华为云账号
2. **访问密钥**: 已创建AccessKey (AK) 和 SecretKey (SK)
3. **项目ID**: 已创建华为云项目并获取项目ID
4. **Node.js**: 版本 >= 18

## 快速开始

### 步骤1: 获取华为云凭证

#### 1.1 创建访问密钥 (AK/SK)

1. 登录[华为云控制台](https://console.huaweicloud.com)
2. 点击右上角用户名 → **我的凭证**
3. 在左侧导航栏选择 **访问密钥**
4. 点击 **新增访问密钥**
5. 完成身份验证后,下载包含AK和SK的credentials.csv文件
6. **重要**: 妥善保管SK,它只在创建时显示一次

#### 1.2 获取项目ID

1. 在华为云控制台,点击右上角用户名 → **我的凭证**
2. 在左侧导航栏选择 **项目列表**
3. 复制您要使用的项目的 **项目ID** (32位十六进制字符串)

### 步骤2: 配置环境变量

创建 `.env` 文件或配置系统环境变量:

```bash
# .env 文件
HUAWEICLOUD_SDK_AK=YOUR_ACCESS_KEY_HERE
HUAWEICLOUD_SDK_SK=YOUR_SECRET_KEY_HERE
HUAWEICLOUD_SDK_PROJECT_ID=YOUR_PROJECT_ID_HERE

# 可选: 指定区域 (默认: cn-north-1)
HUAWEICLOUD_SDK_REGION=cn-north-4

# 可选: 自定义endpoint (优先级高于region)
# HUAWEICLOUD_SDK_ENDPOINT=https://projectman.cn-north-4.myhuaweicloud.com
```

**环境变量说明:**

| 变量名                       | 是否必需 | 说明           | 示例                                              |
| ---------------------------- | -------- | -------------- | ------------------------------------------------- |
| `HUAWEICLOUD_SDK_AK`         | ✅ 是    | 访问密钥ID     | `ABCDEFGHIJKLMNOP1234`                            |
| `HUAWEICLOUD_SDK_SK`         | ✅ 是    | 秘密访问密钥   | `abcd...xyz` (40+字符)                            |
| `HUAWEICLOUD_SDK_PROJECT_ID` | ✅ 是    | 项目ID         | `a1b2c3d4...` (32位hex)                           |
| `HUAWEICLOUD_SDK_REGION`     | ⚪ 否    | 华为云区域     | `cn-north-4`, `ap-southeast-1`                    |
| `HUAWEICLOUD_SDK_ENDPOINT`   | ⚪ 否    | 自定义endpoint | `https://projectman.cn-north-4.myhuaweicloud.com` |

### 步骤3: 启动MCP服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start

# 或直接运行
npx huaweicloud-projectman-mcp stdio
```

### 步骤4: 验证配置

服务器启动时会自动验证配置。成功启动表示配置正确。

如果配置有误,您会看到类似的错误信息:

```
❌ Invalid Huawei Cloud configuration:
   - ak: Access Key (AK) is required
   - project_id: Project ID is required
```

## 配置方式

### 方式1: 环境变量 (推荐)

**优点**: 安全,不会提交到代码仓库

```bash
# Linux/macOS
export HUAWEICLOUD_SDK_AK="YOUR_AK"
export HUAWEICLOUD_SDK_SK="YOUR_SK"
export HUAWEICLOUD_SDK_PROJECT_ID="YOUR_PROJECT_ID"

# Windows PowerShell
$env:HUAWEICLOUD_SDK_AK="YOUR_AK"
$env:HUAWEICLOUD_SDK_SK="YOUR_SK"
$env:HUAWEICLOUD_SDK_PROJECT_ID="YOUR_PROJECT_ID"
```

### 方式2: .env 文件

**优点**: 集中管理,适合开发环境

1. 在项目根目录创建 `.env` 文件
2. 添加配置(见步骤2)
3. 确保 `.env` 已添加到 `.gitignore`

### 方式3: 命令行参数

**优点**: 灵活,适合临时测试

```bash
huaweicloud-projectman-mcp stdio \
  --ak YOUR_AK \
  --sk YOUR_SK \
  --project-id YOUR_PROJECT_ID \
  --region cn-north-4
```

### 配置优先级

```
命令行参数 > 环境变量 > .env文件 > 默认值
```

## 区域选择

### 常用华为云区域

| 区域ID           | 区域名称    | Endpoint                                      |
| ---------------- | ----------- | --------------------------------------------- |
| `cn-north-1`     | 华北-北京一 | `projectman.cn-north-1.myhuaweicloud.com`     |
| `cn-north-4`     | 华北-北京四 | `projectman.cn-north-4.myhuaweicloud.com`     |
| `cn-south-1`     | 华南-广州   | `projectman.cn-south-1.myhuaweicloud.com`     |
| `cn-east-3`      | 华东-上海一 | `projectman.cn-east-3.myhuaweicloud.com`      |
| `ap-southeast-1` | 亚太-香港   | `projectman.ap-southeast-1.myhuaweicloud.com` |

**选择建议**:

- 选择距离用户最近的区域以降低延迟
- 确保您的项目ID属于该区域
- 默认使用 `cn-north-1`

### 区域与Endpoint配置优先级

系统支持两种方式指定服务访问地址:

#### 方式1: 使用区域 (Region)

通过指定区域代码,系统自动构建endpoint:

```bash
# 环境变量方式
HUAWEICLOUD_SDK_REGION=cn-north-4

# 命令行方式
huaweicloud-projectman-mcp stdio --region cn-north-4

# 代码方式
const options: OptionsType = {
  name: 'my-server',
  version: '1.0.0',
  ak: 'YOUR_AK',
  sk: 'YOUR_SK',
  project_id: 'YOUR_PROJECT_ID',
  region: 'cn-north-4',  // 自动转换为 https://projectman.cn-north-4.myhuaweicloud.com
}
```

#### 方式2: 使用自定义Endpoint

直接指定完整的API endpoint URL (优先级更高):

```bash
# 环境变量方式
HUAWEICLOUD_SDK_ENDPOINT=https://projectman.cn-north-4.myhuaweicloud.com

# 命令行方式
huaweicloud-projectman-mcp stdio --endpoint https://projectman.custom.com

# 代码方式
const options: OptionsType = {
  name: 'my-server',
  version: '1.0.0',
  ak: 'YOUR_AK',
  sk: 'YOUR_SK',
  project_id: 'YOUR_PROJECT_ID',
  endpoint: 'https://projectman.custom.com',  // 直接使用自定义endpoint
}
```

#### 配置优先级规则

```
endpoint (自定义) > region (区域) > 默认值 (cn-north-1)
```

**使用场景**:

- **使用region**: 标准华为云公有云环境 (推荐)
- **使用endpoint**: 专有云、VPC endpoint、测试环境、自定义域名

**注意事项**:

1. ✅ Endpoint必须使用HTTPS协议
2. ✅ 如果同时配置了region和endpoint,优先使用endpoint
3. ✅ 未配置region时,默认使用 `cn-north-1`
4. ❌ 使用HTTP的endpoint会被验证拒绝
5. ❌ 确保endpoint URL格式正确,否则客户端初始化会失败

**示例: 三种配置的实际效果**

```typescript
// 场景1: 只配置region
{ region: 'cn-north-4' }
// → 实际endpoint: https://projectman.cn-north-4.myhuaweicloud.com

// 场景2: 只配置endpoint
{ endpoint: 'https://projectman.custom.com' }
// → 实际endpoint: https://projectman.custom.com

// 场景3: 同时配置region和endpoint
{ region: 'cn-north-4', endpoint: 'https://projectman.custom.com' }
// → 实际endpoint: https://projectman.custom.com (endpoint优先)

// 场景4: 都不配置
{}
// → 实际endpoint: https://projectman.cn-north-1.myhuaweicloud.com (默认)
```

## 代码集成示例

### TypeScript/JavaScript

```typescript
import { getProjectManClient } from '@/projectman'
import type { OptionsType } from '@/types/global'

async function example() {
  const options: OptionsType = {
    name: 'my-mcp-server',
    version: '1.0.0',
    // AK/SK/project_id 从环境变量自动读取
  }

  try {
    // 获取客户端(单例,自动缓存)
    const client = getProjectManClient(options)

    console.log('✅ ProjectMan client initialized successfully')

    // 后续使用客户端调用API
    // const projects = await client.listProjects(...)
  } catch (error) {
    console.error('❌ Failed to initialize ProjectMan client:', error.message)
    process.exit(1)
  }
}
```

### 手动配置

```typescript
import { getHuaweiCloudConfig, validateHuaweiCloudConfig, createProjectManClient } from '@/projectman'

// 1. 获取配置
const partialConfig = getHuaweiCloudConfig(options)

// 2. 验证配置
const validation = validateHuaweiCloudConfig(partialConfig)
if (!validation.success) {
  console.error('配置验证失败:', validation.error)
  console.error('缺少字段:', validation.missingFields)
  throw new Error('Invalid configuration')
}

// 3. 创建客户端
const client = createProjectManClient(validation.config)
```

## 故障排查

### 问题1: "Access Key (AK) is required"

**原因**: 未提供AK或AK格式错误

**解决**:

1. 检查环境变量 `HUAWEICLOUD_SDK_AK` 是否设置
2. 验证AK格式(16+位大写字母数字)
3. 确认没有多余的空格或换行符

```bash
# 验证环境变量
echo $HUAWEICLOUD_SDK_AK  # Linux/macOS
echo $env:HUAWEICLOUD_SDK_AK  # Windows PowerShell
```

### 问题2: "Invalid Project ID format"

**原因**: 项目ID格式不正确

**解决**:

1. 项目ID应该是32位十六进制字符串
2. 从华为云控制台复制完整的项目ID
3. 示例格式: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 问题3: "Failed to initialize ProjectMan client"

**原因**: 网络连接失败或凭证无效

**解决**:

1. 检查网络连接
2. 验证AK/SK是否有效(未过期或删除)
3. 确认项目ID属于正确的区域
4. 尝试使用 `--verbose` 查看详细日志

```bash
huaweicloud-projectman-mcp stdio --verbose
```

### 问题4: 认证失败

**原因**: AK/SK无效或没有权限

**解决**:

1. 在华为云控制台确认AK/SK状态
2. 检查IAM权限,确保有ProjectMan服务权限
3. 尝试重新生成AK/SK

## 安全最佳实践

### ✅ 推荐做法

1. **使用环境变量**: 不要在代码中硬编码AK/SK
2. **限制权限**: 为AK配置最小必要权限
3. **定期轮换**: 定期更换AK/SK
4. **保护.env**: 确保 `.env` 文件在 `.gitignore` 中
5. **使用HTTPS**: 始终使用HTTPS endpoint

### ❌ 避免做法

1. ❌ 将AK/SK提交到Git仓库
2. ❌ 在日志中输出完整的AK/SK
3. ❌ 在公共网络传输明文凭证
4. ❌ 使用root账号的AK/SK(应使用IAM子用户)
5. ❌ 共享AK/SK给多个应用

## 高级配置

### 自定义Endpoint

适用于专有云或特殊网络环境:

```bash
HUAWEICLOUD_SDK_ENDPOINT=https://projectman.example.com
```

### 连接超时配置

```typescript
const client = createProjectManClient(config, {
  timeout: 60000, // 60秒
  verbose: true, // 启用详细日志
})
```

### 配置热更新

```typescript
import { resetProjectManClient, getProjectManClient } from '@/projectman'

// 配置更新后
resetProjectManClient() // 清除缓存
const newClient = getProjectManClient(newOptions) // 使用新配置
```

## 下一步

- 📖 阅读 [API文档](../contracts/client-init.ts) 了解详细接口
- 🔬 查看 [数据模型](../data-model.md) 了解类型定义
- 🛠️ 参考 [实施计划](../plan.md) 了解设计决策
- 🧪 运行测试验证配置: `npm test`

## 支持

如遇问题:

1. 检查本文档的故障排查部分
2. 查看项目 [README.md](../../../README.md)
3. 提交 GitHub Issue

---

**文档版本**: 1.0  
**最后更新**: 2025-11-09
