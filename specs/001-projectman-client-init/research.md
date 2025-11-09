# Research: 华为云ProjectMan客户端初始化

**Date**: 2025-11-09  
**Feature**: 001-projectman-client-init  
**Purpose**: 研究华为云SDK最佳实践、配置管理和错误处理策略

## 1. 华为云SDK客户端初始化模式

### 研究发现

华为云SDK (包括ProjectMan) 遵循统一的客户端初始化模式,基于Builder模式构建客户端实例。

### 决策: 使用Builder模式初始化

**选择的方案**: 使用 `ProjectManClient.newBuilder()` 模式

**实施方式**:

```typescript
import { ProjectManClient } from '@huaweicloud/huaweicloud-sdk-projectman'
import { BasicCredentials } from '@huaweicloud/huaweicloud-sdk-core'

// 创建认证凭证
const credentials = new BasicCredentials().withAk(ak).withSk(sk).withProjectId(project_id)

// 构建客户端
const client = ProjectManClient.newBuilder()
  .withCredentials(credentials)
  .withEndpoint(endpoint) // 可选
  .build()
```

**理由**:

1. **官方推荐**: 这是华为云所有SDK的标准初始化模式
2. **灵活性**: Builder模式允许可选配置(endpoint, region, http config等)
3. **类型安全**: TypeScript类型系统能很好地支持Builder链式调用
4. **一致性**: 与其他华为云服务SDK保持一致,降低学习成本

**考虑过的替代方案**:

- ❌ **直接构造函数**: SDK不提供此方式,且缺乏灵活性
- ❌ **工厂函数**: 虽然更简洁,但不符合华为云SDK约定

### 区域和Endpoint配置

**决策**: 支持两种配置方式

1. **指定Endpoint** (推荐用于生产环境):

   ```typescript
   .withEndpoint('https://projectman.cn-north-4.myhuaweicloud.com')
   ```

   - 优点: 明确、稳定、支持专有云
   - 缺点: 需要知道具体endpoint URL

2. **指定Region** (推荐用于多区域部署):
   ```typescript
   .withRegion(ProjectManRegion.CN_NORTH_4)
   ```

   - 优点: SDK自动解析endpoint
   - 缺点: 需要确认ProjectMan SDK是否提供Region枚举

**优先级**: `endpoint` > `region` > 默认值(从环境变量或cn-north-1)

## 2. 配置管理策略

### 研究发现

华为云SDK官方推荐从环境变量读取敏感凭证:

- `HUAWEICLOUD_SDK_AK`
- `HUAWEICLOUD_SDK_SK`
- `HUAWEICLOUD_SDK_PROJECT_ID` (可选)

### 决策: 多层配置优先级

**配置来源优先级** (从高到低):

1. 命令行参数 (通过yargs)
2. 环境变量
3. 配置文件 (如 `.env`)
4. 默认值

**实施方式**:

```typescript
interface OptionsType {
  name: string
  version: string
  // 新增字段
  ak?: string
  sk?: string
  project_id?: string
  region?: string
  endpoint?: string
}

function getCredentials(options: OptionsType) {
  const ak = options.ak || process.env.HUAWEICLOUD_SDK_AK || process.env.HUAWEI_CLOUD_AK

  const sk = options.sk || process.env.HUAWEICLOUD_SDK_SK || process.env.HUAWEI_CLOUD_SK

  const project_id = options.project_id || process.env.HUAWEICLOUD_SDK_PROJECT_ID || process.env.HUAWEI_CLOUD_PROJECT_ID

  return { ak, sk, project_id }
}
```

**理由**:

1. **安全性**: 敏感信息不硬编码
2. **灵活性**: 支持多种部署场景(开发、测试、生产)
3. **兼容性**: 符合12-Factor App原则
4. **可测试性**: 测试时可轻松注入mock凭证

**使用Zod进行运行时验证**:

```typescript
import { z } from 'zod'

const HuaweiCloudConfigSchema = z.object({
  ak: z.string().min(1, 'AK is required'),
  sk: z.string().min(1, 'SK is required'),
  project_id: z.string().min(1, 'Project ID is required'),
  region: z.string().optional(),
  endpoint: z.string().url().optional(),
})

type HuaweiCloudConfig = z.infer<typeof HuaweiCloudConfigSchema>
```

## 3. 错误处理策略

### 研究发现

华为云SDK可能抛出的错误类型:

1. **配置错误**: 缺少AK/SK/project_id
2. **认证错误**: 凭证无效或过期
3. **网络错误**: 无法连接到华为云API
4. **API错误**: 服务端返回错误响应

### 决策: 分层错误处理

**Layer 1: 配置验证** (启动时)

```typescript
function validateConfig(config: unknown): HuaweiCloudConfig {
  try {
    return HuaweiCloudConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.map(e => e.path.join('.')).join(', ')
      throw new Error(`Invalid Huawei Cloud configuration: missing or invalid fields: ${missingFields}`)
    }
    throw error
  }
}
```

**Layer 2: 客户端初始化错误**

```typescript
function createProjectManClient(config: HuaweiCloudConfig): ProjectManClient {
  try {
    const credentials = new BasicCredentials().withAk(config.ak).withSk(config.sk).withProjectId(config.project_id)

    const builder = ProjectManClient.newBuilder().withCredentials(credentials)

    if (config.endpoint) {
      builder.withEndpoint(config.endpoint)
    } else if (config.region) {
      // 假设SDK提供region支持
      builder.withRegion(config.region)
    }

    return builder.build()
  } catch (error) {
    throw new Error(`Failed to initialize ProjectMan client: ${error.message}`)
  }
}
```

**Layer 3: API调用错误** (后续功能)

- 使用try-catch包装API调用
- 区分可重试错误(网络超时)和不可重试错误(认证失败)
- 提供清晰的错误消息供MCP客户端使用

**错误日志策略**:

- ✅ 记录错误类型和消息
- ✅ 记录请求ID(如SDK提供)
- ❌ **绝不记录** AK/SK原始值
- ⚠️ 仅记录AK的前4位和后4位(用于调试)

## 4. 测试策略

### 研究发现

测试华为云SDK客户端需要处理外部依赖。

### 决策: 分离单元测试和集成测试

**单元测试** (无需真实凭证):

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('createProjectManClient', () => {
  it('should create client with valid config', () => {
    const config = {
      ak: 'test-ak',
      sk: 'test-sk',
      project_id: 'test-project-id',
    }

    // Mock SDK
    const mockClient = {}
    vi.mock('@huaweicloud/huaweicloud-sdk-projectman', () => ({
      ProjectManClient: {
        newBuilder: () => ({
          withCredentials: vi.fn().mockReturnThis(),
          withEndpoint: vi.fn().mockReturnThis(),
          build: vi.fn().mockReturnValue(mockClient),
        }),
      },
    }))

    const client = createProjectManClient(config)
    expect(client).toBeDefined()
  })

  it('should throw error when AK is missing', () => {
    expect(() => validateConfig({ sk: 'sk', project_id: 'id' })).toThrow('missing or invalid fields: ak')
  })
})
```

**集成测试** (需要测试凭证):

```typescript
describe('ProjectMan Client Integration', () => {
  it.skipIf(!process.env.HUAWEICLOUD_SDK_AK)('should connect to real API', async () => {
    const config = {
      ak: process.env.HUAWEICLOUD_SDK_AK!,
      sk: process.env.HUAWEICLOUD_SDK_SK!,
      project_id: process.env.HUAWEICLOUD_SDK_PROJECT_ID!,
    }

    const client = createProjectManClient(config)
    // 调用简单API验证连接
    // const response = await client.listProjects()
    // expect(response).toBeDefined()
  })
})
```

**Mock策略**:

- 使用 `vitest` 的 `vi.mock()` mock SDK模块
- 为Builder方法创建链式mock
- 测试配置验证逻辑(真实运行,无需mock)

## 5. TypeScript类型定义

### 决策: 扩展OptionsType接口

**位置**: `src/types/global.ts`

**实施**:

```typescript
export interface OptionsType {
  // 现有字段
  name: string
  version: string

  // 新增: 华为云认证配置 (全部可选,因为可从环境变量读取)
  ak?: string
  sk?: string
  project_id?: string

  // 新增: 可选的区域和endpoint配置
  region?: string
  endpoint?: string
}
```

**理由**:

1. **向后兼容**: 新字段全部可选
2. **类型安全**: TypeScript编译时检查
3. **运行时验证**: 配合Zod schema提供双重保障
4. **文档化**: 类型定义即文档

## 6. 性能考虑

### 决策: 单例客户端模式

**实施**:

```typescript
let cachedClient: ProjectManClient | null = null

export function getProjectManClient(options: OptionsType): ProjectManClient {
  if (!cachedClient) {
    const config = validateConfig(getCredentials(options))
    cachedClient = createProjectManClient(config)
  }
  return cachedClient
}
```

**理由**:

1. **性能**: 避免重复初始化(每次初始化约50-100ms)
2. **连接池**: SDK内部可能维护HTTP连接池
3. **内存**: 减少内存占用
4. **简单**: MCP服务器通常是长期运行的进程,单例足够

**注意事项**:

- 仅在配置不变时复用
- 如需支持配置热更新,需要清除缓存机制

## 总结

### 关键技术决策

| 决策点         | 选择的方案                  | 理由                         |
| -------------- | --------------------------- | ---------------------------- |
| 初始化模式     | Builder模式                 | 华为云SDK标准,灵活且类型安全 |
| 配置来源       | 环境变量优先                | 安全性,符合12-Factor App     |
| 配置验证       | Zod schema                  | 运行时类型安全,清晰错误提示  |
| 错误处理       | 分层处理                    | 配置/初始化/API三层独立处理  |
| 测试策略       | Mock单元测试 + 可选集成测试 | 快速反馈 + 真实环境验证      |
| 客户端生命周期 | 单例模式                    | 性能优化,适合长期运行的服务  |

### 待解决问题

1. ✅ **已解决**: 华为云SDK初始化模式 → Builder模式
2. ✅ **已解决**: 配置管理策略 → 多层优先级
3. ✅ **已解决**: 错误处理 → 分层错误处理
4. ✅ **已解决**: 测试方法 → Mock + 集成测试
5. ⚠️ **待确认**: ProjectMan SDK是否支持Region枚举 (待查看SDK文档或代码)

### 下一步

进入 **Phase 1: Design Artifacts** 创建:

- `data-model.md`: 详细的类型定义
- `contracts/client-init.ts`: API契约
- `quickstart.md`: 使用指南
