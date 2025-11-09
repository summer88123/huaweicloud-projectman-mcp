import { z } from 'zod'
import type { HuaweiCloudConfig, ValidationResult } from './types.js'

/**
 * 华为云AK验证规则
 * - 长度: 16-128字符
 * - 格式: 大写字母和数字
 */
const akSchema = z
  .string()
  .min(16, 'AK长度不能少于16个字符')
  .max(128, 'AK长度不能超过128个字符')
  .regex(/^[A-Z0-9]+$/, 'AK只能包含大写字母和数字')

/**
 * 华为云SK验证规则
 * - 长度: 32-128字符
 */
const skSchema = z.string().min(32, 'SK长度不能少于32个字符').max(128, 'SK长度不能超过128个字符')

/**
 * 项目ID验证规则
 * - 格式: 32位十六进制字符串
 */
const projectIdSchema = z
  .string()
  .length(32, '项目ID必须是32位字符')
  .regex(/^[a-f0-9]{32}$/, '项目ID必须是32位小写十六进制字符串')

/**
 * 区域验证规则
 * - 格式: cn-xxx-x 或 ap-xxx-x
 */
const regionSchema = z.string().regex(/^(cn|ap)-[a-z]+-\d+$/, '区域格式无效,应为 cn-xxx-x 或 ap-xxx-x')

/**
 * Endpoint验证规则
 * - 必须是HTTPS URL
 */
const endpointSchema = z.string().url('endpoint必须是有效的URL').startsWith('https://', 'endpoint必须使用HTTPS协议')

/**
 * 华为云配置验证Schema
 */
export const HuaweiCloudConfigSchema = z.object({
  ak: akSchema,
  sk: skSchema,
  project_id: projectIdSchema,
  region: regionSchema.optional(),
  endpoint: endpointSchema.optional(),
})

/**
 * 验证华为云配置
 * @param config - 待验证的配置对象
 * @returns 验证结果
 */
export function validateHuaweiCloudConfig(config: Partial<HuaweiCloudConfig>): ValidationResult {
  try {
    const validatedConfig = HuaweiCloudConfigSchema.parse(config)
    return {
      success: true,
      config: validatedConfig as HuaweiCloudConfig,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields: string[] = []
      const errors = error.errors.map(e => {
        const field = e.path.join('.')
        if (e.code === 'invalid_type' && e.received === 'undefined') {
          missingFields.push(field)
        }
        return `${field}: ${e.message}`
      })

      return {
        success: false,
        error: errors.join('; '),
        missingFields: missingFields.length > 0 ? missingFields : undefined,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '未知验证错误',
    }
  }
}
