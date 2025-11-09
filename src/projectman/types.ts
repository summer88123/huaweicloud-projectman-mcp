/**
 * 华为云ProjectMan客户端类型定义
 */

import type { ProjectManClient } from '@huaweicloud/huaweicloud-sdk-projectman'

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

/**
 * ProjectMan客户端包装器
 */
export interface ProjectManClientWrapper {
  /** SDK客户端实例 */
  client: ProjectManClient

  /** 客户端配置 */
  config: HuaweiCloudConfig

  /** 创建时间戳 */
  createdAt: number
}

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
