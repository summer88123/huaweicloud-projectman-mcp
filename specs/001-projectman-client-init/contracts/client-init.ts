/**
 * API Contract: ProjectMan客户端初始化
 *
 * 定义客户端初始化模块的公共接口契约
 * Feature: 001-projectman-client-init
 * Date: 2025-11-09
 */

import type { OptionsType } from '@/types/global'
import type { ProjectManClient } from '@huaweicloud/huaweicloud-sdk-projectman'

// ============ 类型定义 ============

/**
 * 华为云认证配置(完整)
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
  /** 是否启用详细日志 @default false */
  verbose?: boolean
  /** 连接超时时间(毫秒) @default 30000 */
  timeout?: number
}

// ============ 错误类型 ============

/**
 * 配置错误
 */
export class ConfigurationError extends Error {
  name = 'ConfigurationError'
  constructor(
    message: string,
    public readonly missingFields?: string[],
  ) {
    super(message)
  }
}

/**
 * 客户端初始化错误
 */
export class ClientInitializationError extends Error {
  name = 'ClientInitializationError'
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message)
  }
}

// ============ 核心API契约 ============

/**
 * 获取华为云配置
 *
 * 从OptionsType和环境变量合并配置,按优先级:
 * 1. options参数中的值
 * 2. 环境变量
 * 3. 默认值
 *
 * @param options MCP服务器配置选项
 * @returns 部分华为云配置(可能缺少必需字段)
 *
 * @example
 * ```typescript
 * const config = getHuaweiCloudConfig({
 *   name: 'my-server',
 *   version: '1.0.0',
 *   ak: 'ABCD...',  // 可选,如不提供则从环境变量读取
 * })
 * ```
 */
export function getHuaweiCloudConfig(options: OptionsType): Partial<HuaweiCloudConfig>

/**
 * 验证华为云配置
 *
 * 使用Zod schema验证配置的完整性和格式正确性
 *
 * @param config 待验证的配置对象
 * @returns 验证结果,包含错误详情或验证后的配置
 *
 * @example
 * ```typescript
 * const result = validateHuaweiCloudConfig(config)
 * if (!result.success) {
 *   console.error(result.error)
 *   console.error('Missing fields:', result.missingFields)
 *   throw new ConfigurationError(result.error, result.missingFields)
 * }
 * // 使用 result.config (已验证)
 * ```
 */
export function validateHuaweiCloudConfig(config: unknown): ValidationResult

/**
 * 创建ProjectMan客户端实例
 *
 * 使用华为云SDK的Builder模式创建客户端实例
 *
 * @param config 已验证的华为云配置
 * @param options 可选的客户端初始化选项
 * @returns ProjectMan客户端实例
 * @throws {ClientInitializationError} 如果客户端创建失败
 *
 * @example
 * ```typescript
 * try {
 *   const client = createProjectManClient(validatedConfig)
 *   // 客户端已就绪,可以调用API
 * } catch (error) {
 *   if (error instanceof ClientInitializationError) {
 *     console.error('Init failed:', error.message)
 *     console.error('Cause:', error.cause)
 *   }
 * }
 * ```
 */
export function createProjectManClient(
  config: HuaweiCloudConfig,
  options?: Partial<ClientInitOptions>,
): ProjectManClient

/**
 * 获取或创建ProjectMan客户端(单例模式)
 *
 * 首次调用时创建客户端实例,后续调用返回缓存的实例
 * 如果配置发生变化,会重新创建客户端
 *
 * @param options MCP服务器配置选项
 * @returns ProjectMan客户端实例
 * @throws {ConfigurationError} 如果配置验证失败
 * @throws {ClientInitializationError} 如果客户端创建失败
 *
 * @example
 * ```typescript
 * // 主程序入口
 * const client = getProjectManClient(options)
 *
 * // 其他模块中复用
 * const sameClient = getProjectManClient(options)  // 返回相同实例
 * ```
 */
export function getProjectManClient(options: OptionsType): ProjectManClient

/**
 * 重置客户端缓存
 *
 * 清除单例缓存,下次调用getProjectManClient时会重新创建客户端
 * 主要用于测试或配置热更新场景
 *
 * @example
 * ```typescript
 * // 配置更新后
 * resetProjectManClient()
 * const newClient = getProjectManClient(newOptions)
 * ```
 */
export function resetProjectManClient(): void

// ============ 辅助工具 ============

/**
 * 获取配置摘要(不含敏感信息)
 *
 * 返回用于日志和调试的配置摘要,敏感信息已脱敏
 *
 * @param config 华为云配置
 * @returns 配置摘要对象
 *
 * @example
 * ```typescript
 * const summary = getConfigSummary(config)
 * console.log('Client initialized:', summary)
 * // 输出: { akPrefix: 'ABCD', projectId: 'a1b2...', region: 'cn-north-4' }
 * ```
 */
export function getConfigSummary(config: HuaweiCloudConfig): {
  /** AK前4位 */
  akPrefix: string
  /** 完整项目ID (非敏感) */
  projectId: string
  /** 区域 */
  region?: string
  /** Endpoint */
  endpoint?: string
}

/**
 * 检查客户端是否已初始化
 *
 * @returns 是否存在缓存的客户端实例
 */
export function isClientInitialized(): boolean

// ============ 类型守卫 ============

/**
 * 类型守卫:检查是否为有效的HuaweiCloudConfig
 */
export function isValidHuaweiCloudConfig(config: unknown): config is HuaweiCloudConfig

// ============ 常量 ============

/**
 * 支持的环境变量名称
 */
export const ENV_VARS: {
  readonly AK: readonly ['HUAWEICLOUD_SDK_AK', 'HUAWEI_CLOUD_AK']
  readonly SK: readonly ['HUAWEICLOUD_SDK_SK', 'HUAWEI_CLOUD_SK']
  readonly PROJECT_ID: readonly ['HUAWEICLOUD_SDK_PROJECT_ID', 'HUAWEI_CLOUD_PROJECT_ID']
  readonly REGION: readonly ['HUAWEICLOUD_SDK_REGION', 'HUAWEI_CLOUD_REGION']
  readonly ENDPOINT: readonly ['HUAWEICLOUD_SDK_ENDPOINT', 'HUAWEI_CLOUD_ENDPOINT']
}

/**
 * 默认配置值
 */
export const DEFAULT_CONFIG: {
  readonly REGION: 'cn-north-1'
  readonly TIMEOUT: 30000
}

// ============ 使用示例 ============

/**
 * 完整使用流程示例
 *
 * @example
 * ```typescript
 * import { getProjectManClient } from '@/projectman'
 * import type { OptionsType } from '@/types/global'
 *
 * async function main() {
 *   const options: OptionsType = {
 *     name: 'huaweicloud-projectman-mcp',
 *     version: '1.0.0',
 *     // AK/SK/project_id 从环境变量读取
 *   }
 *
 *   try {
 *     // 获取客户端(自动验证配置并创建)
 *     const client = getProjectManClient(options)
 *
 *     // 客户端就绪,可以调用API
 *     // const projects = await client.listProjects()
 *
 *   } catch (error) {
 *     if (error instanceof ConfigurationError) {
 *       console.error('配置错误:', error.message)
 *       console.error('缺少字段:', error.missingFields)
 *       process.exit(1)
 *     }
 *     if (error instanceof ClientInitializationError) {
 *       console.error('客户端初始化失败:', error.message)
 *       process.exit(1)
 *     }
 *     throw error
 *   }
 * }
 * ```
 */

/**
 * 测试场景示例
 *
 * @example
 * ```typescript
 * import { describe, it, expect, beforeEach } from 'vitest'
 * import {
 *   validateHuaweiCloudConfig,
 *   resetProjectManClient,
 *   getProjectManClient
 * } from '@/projectman'
 *
 * describe('ProjectMan Client', () => {
 *   beforeEach(() => {
 *     resetProjectManClient()  // 每个测试前清除缓存
 *   })
 *
 *   it('should validate correct config', () => {
 *     const config = {
 *       ak: 'ABCDEFGHIJKLMNOP1234',
 *       sk: 'abcdefghijklmnopqrstuvwxyz1234567890abcd',
 *       project_id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
 *     }
 *
 *     const result = validateHuaweiCloudConfig(config)
 *     expect(result.success).toBe(true)
 *     expect(result.config).toEqual(expect.objectContaining(config))
 *   })
 *
 *   it('should reject missing AK', () => {
 *     const config = {
 *       sk: 'abcdefghijklmnopqrstuvwxyz1234567890abcd',
 *       project_id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
 *     }
 *
 *     const result = validateHuaweiCloudConfig(config)
 *     expect(result.success).toBe(false)
 *     expect(result.missingFields).toContain('ak')
 *   })
 * })
 * ```
 */
