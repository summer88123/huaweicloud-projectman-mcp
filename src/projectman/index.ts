import { BasicCredentials } from '@huaweicloud/huaweicloud-sdk-core'
import { ProjectManClient } from '@huaweicloud/huaweicloud-sdk-projectman'
import type { ClientInitOptions, HuaweiCloudConfig, ProjectManClientWrapper } from './types.js'
import { ClientInitializationError, ConfigurationError } from './types.js'
import { validateHuaweiCloudConfig } from './validation.js'

/**
 * 单例缓存的客户端实例
 */
let cachedClient: ProjectManClientWrapper | null = null

/**
 * 获取ProjectMan客户端实例(单例模式)
 *
 * @param config - 华为云配置
 * @param options - 客户端初始化选项
 * @returns ProjectMan客户端包装器
 * @throws {ConfigurationError} 配置验证失败
 * @throws {ClientInitializationError} 客户端初始化失败
 */
export function getProjectManClient(
  config: Partial<HuaweiCloudConfig>,
  options?: Partial<ClientInitOptions>,
): ProjectManClientWrapper {
  // 验证配置
  const validation = validateHuaweiCloudConfig(config)
  if (!validation.success || !validation.config) {
    throw new ConfigurationError(validation.error ?? '配置验证失败', validation.missingFields)
  }

  const validConfig = validation.config

  // 检查是否有缓存的客户端
  if (cachedClient) {
    // 验证缓存的配置是否一致
    if (
      cachedClient.config.ak === validConfig.ak &&
      cachedClient.config.sk === validConfig.sk &&
      cachedClient.config.project_id === validConfig.project_id &&
      cachedClient.config.region === validConfig.region &&
      cachedClient.config.endpoint === validConfig.endpoint
    ) {
      return cachedClient
    }

    // 配置变化,清除旧缓存
    cachedClient = null
  }

  // 创建新客户端
  try {
    const client = createProjectManClient(validConfig, options)
    cachedClient = {
      client,
      config: validConfig,
      createdAt: Date.now(),
    }
    return cachedClient
  } catch (error) {
    throw new ClientInitializationError('创建ProjectMan客户端失败', error instanceof Error ? error : undefined)
  }
}

/**
 * 创建ProjectMan客户端
 *
 * @param config - 已验证的华为云配置
 * @param options - 客户端初始化选项
 * @returns ProjectMan客户端实例
 */
export function createProjectManClient(
  config: HuaweiCloudConfig,
  options?: Partial<ClientInitOptions>,
): ProjectManClient {
  // 创建基础凭证
  const credentials = new BasicCredentials().withAk(config.ak).withSk(config.sk).withProjectId(config.project_id)

  // 创建客户端
  const client = ProjectManClient.newBuilder().withCredential(credentials)

  // 配置endpoint或region
  if (config.endpoint) {
    client.withEndpoint(config.endpoint)
  } else if (config.region) {
    // 使用region构建endpoint
    const endpoint = `https://projectman.${config.region}.myhuaweicloud.com`
    client.withEndpoint(endpoint)
  } else {
    // 默认使用cn-north-1
    client.withEndpoint('https://projectman.cn-north-1.myhuaweicloud.com')
  }

  return client.build()
}

/**
 * 重置ProjectMan客户端缓存
 * 用于测试或需要强制重新创建客户端的场景
 */
export function resetProjectManClient(): void {
  cachedClient = null
}

/**
 * 获取配置摘要(脱敏版本,用于日志记录)
 *
 * @param config - 华为云配置
 * @returns 脱敏后的配置摘要
 */
export function getConfigSummary(config: Partial<HuaweiCloudConfig>): Record<string, string> {
  const maskString = (str: string | undefined, visibleChars: number = 4): string => {
    if (!str) return '[未设置]'
    if (str.length <= visibleChars) return '***'
    return `${str.substring(0, visibleChars)}...${str.substring(str.length - visibleChars)}`
  }

  return {
    ak: maskString(config.ak),
    sk: maskString(config.sk, 3),
    project_id: maskString(config.project_id, 8),
    region: config.region ?? '[未设置]',
    endpoint: config.endpoint ?? '[未设置]',
  }
}

/**
 * 导出验证函数(便于外部使用)
 */
export { validateHuaweiCloudConfig } from './validation.js'

/**
 * 导出类型和错误类
 */
export type { ClientInitOptions, HuaweiCloudConfig, ProjectManClientWrapper, ValidationResult } from './types.js'

export { AuthenticationError, ClientInitializationError, ConfigurationError } from './types.js'
