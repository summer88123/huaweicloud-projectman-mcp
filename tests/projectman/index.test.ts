/**
 * ProjectMan客户端初始化单元测试
 */

import {
  ConfigurationError,
  createProjectManClient,
  getConfigSummary,
  getProjectManClient,
  resetProjectManClient,
  validateHuaweiCloudConfig,
} from '@/projectman/index.js'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  configEmptyStrings,
  configInvalidAKLowercase,
  configInvalidAKSpecialChars,
  configInvalidAKTooShort,
  configInvalidEndpointHTTP,
  configInvalidEndpointNotURL,
  configInvalidProjectIdLength,
  configInvalidProjectIdNonHex,
  configInvalidProjectIdUppercase,
  configInvalidRegion,
  configInvalidSKTooShort,
  configMissingAK,
  configMissingProjectId,
  configMissingSK,
  configSpecialCharsInOptional,
  validConfig,
  validConfigWithEndpoint,
  validMinimalConfig,
} from './fixtures.js'

describe('ProjectMan Client Initialization', () => {
  beforeEach(() => {
    // 每个测试前重置客户端缓存
    resetProjectManClient()
  })

  describe('validateHuaweiCloudConfig', () => {
    it('应该验证通过有效配置', () => {
      const result = validateHuaweiCloudConfig(validConfig)
      expect(result.success).toBe(true)
      expect(result.config).toEqual(validConfig)
      expect(result.error).toBeUndefined()
      expect(result.missingFields).toBeUndefined()
    })

    it('应该验证通过使用endpoint的配置', () => {
      const result = validateHuaweiCloudConfig(validConfigWithEndpoint)
      expect(result.success).toBe(true)
      expect(result.config).toBeDefined()
    })

    it('应该验证通过最小配置(无region/endpoint)', () => {
      const result = validateHuaweiCloudConfig(validMinimalConfig)
      expect(result.success).toBe(true)
      expect(result.config).toBeDefined()
    })

    describe('缺失字段验证', () => {
      it('应该拒绝缺少AK的配置', () => {
        const result = validateHuaweiCloudConfig(configMissingAK)
        expect(result.success).toBe(false)
        expect(result.error).toContain('ak')
        expect(result.missingFields).toContain('ak')
      })

      it('应该拒绝缺少SK的配置', () => {
        const result = validateHuaweiCloudConfig(configMissingSK)
        expect(result.success).toBe(false)
        expect(result.error).toContain('sk')
        expect(result.missingFields).toContain('sk')
      })

      it('应该拒绝缺少project_id的配置', () => {
        const result = validateHuaweiCloudConfig(configMissingProjectId)
        expect(result.success).toBe(false)
        expect(result.error).toContain('project_id')
        expect(result.missingFields).toContain('project_id')
      })
    })

    describe('AK格式验证', () => {
      it('应该拒绝过短的AK', () => {
        const result = validateHuaweiCloudConfig(configInvalidAKTooShort)
        expect(result.success).toBe(false)
        expect(result.error).toContain('AK')
      })

      it('应该拒绝包含小写字母的AK', () => {
        const result = validateHuaweiCloudConfig(configInvalidAKLowercase)
        expect(result.success).toBe(false)
        expect(result.error).toContain('AK')
      })

      it('应该拒绝包含特殊字符的AK', () => {
        const result = validateHuaweiCloudConfig(configInvalidAKSpecialChars)
        expect(result.success).toBe(false)
        expect(result.error).toContain('AK')
      })
    })

    describe('SK格式验证', () => {
      it('应该拒绝过短的SK', () => {
        const result = validateHuaweiCloudConfig(configInvalidSKTooShort)
        expect(result.success).toBe(false)
        expect(result.error).toContain('SK')
      })
    })

    describe('project_id格式验证', () => {
      it('应该拒绝长度不为32的project_id', () => {
        const result = validateHuaweiCloudConfig(configInvalidProjectIdLength)
        expect(result.success).toBe(false)
        expect(result.error).toContain('项目ID')
      })

      it('应该拒绝包含大写字母的project_id', () => {
        const result = validateHuaweiCloudConfig(configInvalidProjectIdUppercase)
        expect(result.success).toBe(false)
        expect(result.error).toContain('项目ID')
      })

      it('应该拒绝包含非十六进制字符的project_id', () => {
        const result = validateHuaweiCloudConfig(configInvalidProjectIdNonHex)
        expect(result.success).toBe(false)
        expect(result.error).toContain('项目ID')
      })
    })

    describe('region格式验证', () => {
      it('应该拒绝无效的region格式', () => {
        const result = validateHuaweiCloudConfig(configInvalidRegion)
        expect(result.success).toBe(false)
        expect(result.error).toContain('区域')
      })
    })

    describe('endpoint格式验证', () => {
      it('应该拒绝使用HTTP的endpoint', () => {
        const result = validateHuaweiCloudConfig(configInvalidEndpointHTTP)
        expect(result.success).toBe(false)
        expect(result.error).toContain('HTTPS')
      })

      it('应该拒绝非URL格式的endpoint', () => {
        const result = validateHuaweiCloudConfig(configInvalidEndpointNotURL)
        expect(result.success).toBe(false)
        expect(result.error).toContain('endpoint')
      })
    })

    describe('边缘案例', () => {
      it('应该拒绝空字符串', () => {
        const result = validateHuaweiCloudConfig(configEmptyStrings)
        expect(result.success).toBe(false)
      })

      it('应该拒绝可选字段中的特殊字符', () => {
        const result = validateHuaweiCloudConfig(configSpecialCharsInOptional)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('createProjectManClient', () => {
    it('应该成功创建客户端(使用region)', () => {
      const client = createProjectManClient(validConfig)
      expect(client).toBeDefined()
    })

    it('应该成功创建客户端(使用endpoint)', () => {
      const client = createProjectManClient(validConfigWithEndpoint)
      expect(client).toBeDefined()
    })

    it('应该成功创建客户端(使用默认region)', () => {
      const client = createProjectManClient(validMinimalConfig)
      expect(client).toBeDefined()
    })
  })

  describe('getProjectManClient', () => {
    it('应该成功获取客户端', () => {
      const wrapper = getProjectManClient(validConfig)
      expect(wrapper).toBeDefined()
      expect(wrapper.client).toBeDefined()
      expect(wrapper.config).toEqual(validConfig)
      expect(wrapper.createdAt).toBeGreaterThan(0)
    })

    it('应该返回缓存的客户端(相同配置)', () => {
      const wrapper1 = getProjectManClient(validConfig)
      const wrapper2 = getProjectManClient(validConfig)
      expect(wrapper1).toBe(wrapper2)
      expect(wrapper1.createdAt).toBe(wrapper2.createdAt)
    })

    it('应该创建新客户端(不同配置)', () => {
      const wrapper1 = getProjectManClient(validConfig)
      const wrapper2 = getProjectManClient(validConfigWithEndpoint)
      expect(wrapper1).not.toBe(wrapper2)
      expect(wrapper1.config).not.toEqual(wrapper2.config)
    })

    it('应该抛出ConfigurationError(配置验证失败)', () => {
      expect(() => getProjectManClient(configMissingAK)).toThrow(ConfigurationError)
    })

    it('应该抛出ConfigurationError并包含缺失字段', () => {
      try {
        getProjectManClient(configMissingAK)
        expect.fail('应该抛出ConfigurationError')
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigurationError)
        if (error instanceof ConfigurationError) {
          expect(error.missingFields).toContain('ak')
        }
      }
    })
  })

  describe('resetProjectManClient', () => {
    it('应该清除客户端缓存', () => {
      const wrapper1 = getProjectManClient(validConfig)
      resetProjectManClient()
      const wrapper2 = getProjectManClient(validConfig)
      expect(wrapper1).not.toBe(wrapper2)
      // 时间戳可能相同(执行太快),但对象应该不同
      expect(wrapper1.client).not.toBe(wrapper2.client)
    })
  })

  describe('getConfigSummary', () => {
    it('应该返回脱敏的配置摘要', () => {
      const summary = getConfigSummary(validConfig)
      expect(summary.ak).toContain('ABCD')
      expect(summary.ak).toContain('...')
      expect(summary.sk).toContain('123')
      expect(summary.sk).toContain('...')
      expect(summary.project_id).toContain('a1b2c3d4')
      expect(summary.region).toBe('cn-north-1')
    })

    it('应该处理未设置的字段', () => {
      const summary = getConfigSummary({})
      expect(summary.ak).toContain('[未设置]')
      expect(summary.sk).toContain('[未设置]')
      expect(summary.project_id).toContain('[未设置]')
      expect(summary.region).toContain('[未设置]')
      expect(summary.endpoint).toContain('[未设置]')
    })

    it('应该处理短字符串', () => {
      const summary = getConfigSummary({
        ak: 'ABC',
        sk: '12',
        project_id: '123',
      })
      expect(summary.ak).toBe('***')
      expect(summary.sk).toBe('***')
      expect(summary.project_id).toBe('***')
    })

    it('应该处理自定义endpoint', () => {
      const summary = getConfigSummary(validConfigWithEndpoint)
      expect(summary.endpoint).toBe('https://custom.myhuaweicloud.com')
    })
  })
})
