import type { HuaweiCloudConfig } from '@/projectman/types.js'
import type { OptionsType } from '@/types'
import { nanoid } from 'nanoid'
import type { ArgumentsCamelCase } from 'yargs'

/**
 * 环境变量名称映射
 * 支持多种环境变量名称以提高兼容性
 */
const ENV_VARS = {
  ak: ['HUAWEICLOUD_SDK_AK', 'HUAWEI_CLOUD_AK'],
  sk: ['HUAWEICLOUD_SDK_SK', 'HUAWEI_CLOUD_SK'],
  project_id: ['HUAWEICLOUD_SDK_PROJECT_ID', 'HUAWEI_CLOUD_PROJECT_ID'],
  region: ['HUAWEICLOUD_SDK_REGION', 'HUAWEI_CLOUD_REGION'],
  endpoint: ['HUAWEICLOUD_SDK_ENDPOINT', 'HUAWEI_CLOUD_ENDPOINT'],
} as const

export function generateSessionId() {
  return nanoid()
}

/**
 * 从多个环境变量名称中获取值
 * @param keys - 环境变量名称数组
 * @returns 第一个非空的环境变量值
 */
export function getEnvValue(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]
    if (value) {
      return value
    }
  }
  return undefined
}

/**
 * 从OptionsType和环境变量中获取华为云配置
 * 优先级: OptionsType > 环境变量
 *
 * @param options - MCP服务器选项
 * @returns 华为云配置对象(可能包含未定义的字段)
 */
export function getHuaweiCloudConfig(options: OptionsType): Partial<HuaweiCloudConfig> {
  return {
    ak: options.ak ?? getEnvValue(ENV_VARS.ak),
    sk: options.sk ?? getEnvValue(ENV_VARS.sk),
    project_id: options.project_id ?? getEnvValue(ENV_VARS.project_id),
    region: options.region ?? getEnvValue(ENV_VARS.region) ?? 'cn-north-1',
    endpoint: options.endpoint ?? getEnvValue(ENV_VARS.endpoint),
  }
}

export function getOptions(
  argv: ArgumentsCamelCase,
  pkg: {
    name: string
    version: string
  },
): OptionsType {
  return {
    name: pkg.name,
    version: pkg.version,
    // 从命令行参数或环境变量获取华为云配置
    ak: (argv.ak as string | undefined) ?? getEnvValue(ENV_VARS.ak),
    sk: (argv.sk as string | undefined) ?? getEnvValue(ENV_VARS.sk),
    project_id: (argv.projectId as string | undefined) ?? getEnvValue(ENV_VARS.project_id),
    region: (argv.region as string | undefined) ?? getEnvValue(ENV_VARS.region),
    endpoint: (argv.endpoint as string | undefined) ?? getEnvValue(ENV_VARS.endpoint),
  }
}
