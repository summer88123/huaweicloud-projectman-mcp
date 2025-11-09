# Data Model: 华为云ProjectMan客户端配置

**Feature**: 001-projectman-client-init  
**Date**: 2025-11-09  
**Status**: Design

## Overview

本文档定义华为云ProjectMan客户端初始化所需的数据模型,包括配置接口、验证schema和客户端实例类型。

## 1. 配置类型定义

### 1.1 OptionsType接口扩展

**文件**: `src/types/global.ts`

```typescript
/**
 * MCP服务器配置选项
 */
export interface OptionsType {
  /** MCP服务器名称 */
  name: string

  /** MCP服务器版本 */
  version: string

  // ============ 华为云ProjectMan配置 ============

  /**
   * 华为云访问密钥ID (Access Key)
   * 可通过环境变量 HUAWEICLOUD_SDK_AK 或 HUAWEI_CLOUD_AK 提供
   * @optional 如未提供,将从环境变量读取
   */
  ak?: string

  /**
   * 华为云秘密访问密钥 (Secret Key)
   * 可通过环境变量 HUAWEICLOUD_SDK_SK 或 HUAWEI_CLOUD_SK 提供
   * @optional 如未提供,将从环境变量读取
   */
  sk?: string

  /**
   * 华为云项目ID
   * 可通过环境变量 HUAWEICLOUD_SDK_PROJECT_ID 或 HUAWEI_CLOUD_PROJECT_ID 提供
   * @optional 如未提供,将从环境变量读取
   */
  project_id?: string

  /**
   * 华为云区域标识符
   * 例如: 'cn-north-1', 'cn-north-4', 'ap-southeast-1'
   * @optional 默认: 从环境变量或 'cn-north-1'
   */
  region?: string

  /**
   * 自定义服务终端节点 URL
   * 例如: 'https://projectman.cn-north-4.myhuaweicloud.com'
   * 优先级高于 region
   * @optional 如未提供,将根据 region 自动生成
   */
  endpoint?: string
}
```

### 1.2 华为云配置类型

**文件**: `src/projectman/types.ts` (新建)

```typescript
/**
 * 华为云认证配置
 * 所有字段都是必需的(从OptionsType和环境变量合并后)
 */
export interface HuaweiCloudConfig {
  /** 访问密钥ID */
  ak: string

  /** 秘密访问密钥 */
  sk: string

  /** 项目ID */
  project_id: string

  /** 区域标识符 (可选) */
  region?: string

  /** 自定义endpoint (可选) */
  endpoint?: string
}

/**
 * 配置验证结果
 */
export interface ValidationResult {
  /** 验证是否成功 */
  success: boolean

  /** 验证后的配置(如果成功) */
  config?: HuaweiCloudConfig

  /** 错误消息(如果失败) */
  error?: string

  /** 缺失的字段列表(如果失败) */
  missingFields?: string[]
}

/**
 * 客户端初始化选项
 */
export interface ClientInitOptions {
  /** 华为云配置 */
  config: HuaweiCloudConfig

  /** 是否启用详细日志 */
  verbose?: boolean

  /** 连接超时时间(毫秒) */
  timeout?: number
}
```

## 2. 运行时验证Schema

### 2.1 Zod验证Schema

**文件**: `src/projectman/validation.ts` (新建)

```typescript
import { z } from 'zod'

/**
 * 华为云配置验证Schema
 */
export const HuaweiCloudConfigSchema = z.object({
  ak: z
    .string()
    .min(1, 'Access Key (AK) is required')
    .regex(/^[A-Z0-9]{16,}$/, 'Invalid AK format: must be uppercase alphanumeric, at least 16 characters'),

  sk: z.string().min(1, 'Secret Key (SK) is required').min(32, 'Invalid SK format: must be at least 32 characters'),

  project_id: z
    .string()
    .min(1, 'Project ID is required')
    .regex(/^[a-f0-9]{32}$/, 'Invalid Project ID format: must be 32-character hexadecimal'),

  region: z
    .string()
    .regex(/^[a-z]+-[a-z]+-\d+$/, 'Invalid region format')
    .optional(),

  endpoint: z.string().url('Endpoint must be a valid URL').startsWith('https://', 'Endpoint must use HTTPS').optional(),
})

/**
 * 部分配置Schema (用于OptionsType中的可选字段)
 */
export const PartialHuaweiCloudConfigSchema = HuaweiCloudConfigSchema.partial()

/**
 * TypeScript类型推导
 */
export type HuaweiCloudConfigValidated = z.infer<typeof HuaweiCloudConfigSchema>
```

### 2.2 验证函数

```typescript
import type { ValidationResult, HuaweiCloudConfig } from './types'
import { HuaweiCloudConfigSchema } from './validation'
import { ZodError } from 'zod'

/**
 * 验证华为云配置
 * @param config 待验证的配置对象
 * @returns 验证结果
 */
export function validateHuaweiCloudConfig(config: unknown): ValidationResult {
  try {
    const validatedConfig = HuaweiCloudConfigSchema.parse(config)
    return {
      success: true,
      config: validatedConfig,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const missingFields = error.errors.map(e => e.path.join('.'))
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)

      return {
        success: false,
        error: `Invalid Huawei Cloud configuration:\n${errorMessages.join('\n')}`,
        missingFields,
      }
    }

    return {
      success: false,
      error: `Unexpected validation error: ${error}`,
    }
  }
}
```

## 3. 配置合并逻辑

### 3.1 环境变量定义

```typescript
/**
 * 支持的环境变量
 */
export const ENV_VARS = {
  AK: ['HUAWEICLOUD_SDK_AK', 'HUAWEI_CLOUD_AK'] as const,
  SK: ['HUAWEICLOUD_SDK_SK', 'HUAWEI_CLOUD_SK'] as const,
  PROJECT_ID: ['HUAWEICLOUD_SDK_PROJECT_ID', 'HUAWEI_CLOUD_PROJECT_ID'] as const,
  REGION: ['HUAWEICLOUD_SDK_REGION', 'HUAWEI_CLOUD_REGION'] as const,
  ENDPOINT: ['HUAWEICLOUD_SDK_ENDPOINT', 'HUAWEI_CLOUD_ENDPOINT'] as const,
} as const
```

### 3.2 配置获取函数

```typescript
import type { OptionsType } from '@/types/global'
import type { HuaweiCloudConfig } from './types'

/**
 * 从环境变量获取值(支持多个备选变量名)
 */
function getEnvValue(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]
    if (value) return value
  }
  return undefined
}

/**
 * 从OptionsType和环境变量合并获取华为云配置
 * 优先级: options参数 > 环境变量 > 默认值
 */
export function getHuaweiCloudConfig(options: OptionsType): Partial<HuaweiCloudConfig> {
  return {
    ak: options.ak || getEnvValue(ENV_VARS.AK),
    sk: options.sk || getEnvValue(ENV_VARS.SK),
    project_id: options.project_id || getEnvValue(ENV_VARS.PROJECT_ID),
    region: options.region || getEnvValue(ENV_VARS.REGION) || 'cn-north-1',
    endpoint: options.endpoint || getEnvValue(ENV_VARS.ENDPOINT),
  }
}
```

## 4. 客户端实例类型

### 4.1 ProjectManClient类型

```typescript
import type { ProjectManClient as SDKProjectManClient } from '@huaweicloud/huaweicloud-sdk-projectman'

/**
 * ProjectMan客户端实例
 * (直接使用SDK提供的类型)
 */
export type ProjectManClient = SDKProjectManClient

/**
 * 客户端包装器(用于单例和缓存)
 */
export interface ProjectManClientWrapper {
  /** 客户端实例 */
  client: ProjectManClient

  /** 创建时间 */
  createdAt: Date

  /** 配置摘要(不含敏感信息) */
  configSummary: {
    akPrefix: string // AK前4位
    projectId: string
    region?: string
    endpoint?: string
  }
}
```

## 5. 错误类型定义

### 5.1 自定义错误类

```typescript
/**
 * 配置错误基类
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly missingFields?: string[],
  ) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

/**
 * 客户端初始化错误
 */
export class ClientInitializationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = 'ClientInitializationError'
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}
```

## 6. 数据流

### 6.1 配置流程

```
OptionsType (可选字段)
    ↓
合并环境变量
    ↓
Partial<HuaweiCloudConfig>
    ↓
Zod验证
    ↓
HuaweiCloudConfig (完整必需字段)
    ↓
创建客户端
    ↓
ProjectManClient实例
```

### 6.2 状态图

```
[未初始化]
    |
    | getHuaweiCloudConfig()
    ↓
[配置收集]
    |
    | validateHuaweiCloudConfig()
    ↓
[配置验证] ----失败----> [ConfigurationError]
    |
    | 成功
    ↓
[创建客户端] ----失败----> [ClientInitializationError]
    |
    | 成功
    ↓
[已初始化 - 单例缓存]
```

## 7. 类型导出

### 7.1 公共API类型

```typescript
// src/projectman/index.ts
export type {
  HuaweiCloudConfig,
  ValidationResult,
  ClientInitOptions,
  ProjectManClient,
  ProjectManClientWrapper,
} from './types'

export { ConfigurationError, ClientInitializationError, AuthenticationError } from './types'
```

## 8. 测试数据模型

### 8.1 Mock数据

```typescript
// tests/projectman/fixtures.ts
export const mockValidConfig: HuaweiCloudConfig = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: 'abcdefghijklmnopqrstuvwxyz1234567890abcd',
  project_id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  region: 'cn-north-4',
}

export const mockInvalidConfigs = {
  missingAk: {
    sk: 'abcdefghijklmnopqrstuvwxyz1234567890abcd',
    project_id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  },
  invalidAkFormat: {
    ak: 'invalid-ak',
    sk: 'abcdefghijklmnopqrstuvwxyz1234567890abcd',
    project_id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  },
  invalidProjectIdFormat: {
    ak: 'ABCDEFGHIJKLMNOP1234',
    sk: 'abcdefghijklmnopqrstuvwxyz1234567890abcd',
    project_id: 'invalid-project-id',
  },
}
```

## 总结

### 关键实体

| 实体                      | 用途                | 验证             |
| ------------------------- | ------------------- | ---------------- |
| `OptionsType`             | MCP服务器配置(扩展) | TypeScript编译时 |
| `HuaweiCloudConfig`       | 完整华为云配置      | Zod运行时        |
| `ValidationResult`        | 验证结果载体        | -                |
| `ProjectManClient`        | SDK客户端实例       | SDK内部          |
| `ProjectManClientWrapper` | 客户端包装器        | -                |

### 设计原则

1. **类型安全**: TypeScript接口 + Zod运行时验证
2. **灵活配置**: 支持多种配置来源,明确优先级
3. **清晰错误**: 自定义错误类,包含详细上下文
4. **可测试**: Mock友好的类型设计
5. **安全性**: 配置摘要不含完整敏感信息
