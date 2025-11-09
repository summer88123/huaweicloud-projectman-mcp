/**
 * 测试用的 Mock 配置数据
 */

import type { HuaweiCloudConfig } from '@/projectman/types.js'

/**
 * 有效的测试配置
 */
export const validConfig: HuaweiCloudConfig = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-north-1',
}

/**
 * 有效配置 - 使用自定义endpoint
 */
export const validConfigWithEndpoint: HuaweiCloudConfig = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  endpoint: 'https://custom.myhuaweicloud.com',
}

/**
 * 有效配置 - 最小配置(无region/endpoint)
 */
export const validMinimalConfig: HuaweiCloudConfig = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
}

/**
 * 无效配置 - 缺少AK
 */
export const configMissingAK = {
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-north-1',
}

/**
 * 无效配置 - 缺少SK
 */
export const configMissingSK = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-north-1',
}

/**
 * 无效配置 - 缺少project_id
 */
export const configMissingProjectId = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  region: 'cn-north-1',
}

/**
 * 无效配置 - AK格式错误(太短)
 */
export const configInvalidAKTooShort = {
  ak: 'SHORT',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-north-1',
}

/**
 * 无效配置 - AK格式错误(包含小写字母)
 */
export const configInvalidAKLowercase = {
  ak: 'abcdefghijklmnop1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-north-1',
}

/**
 * 无效配置 - AK格式错误(包含特殊字符)
 */
export const configInvalidAKSpecialChars = {
  ak: 'ABCDEF@#$%^&*()1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-north-1',
}

/**
 * 无效配置 - SK格式错误(太短)
 */
export const configInvalidSKTooShort = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: 'tooshort',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-north-1',
}

/**
 * 无效配置 - project_id格式错误(不是32位)
 */
export const configInvalidProjectIdLength = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'tooshort',
  region: 'cn-north-1',
}

/**
 * 无效配置 - project_id格式错误(包含大写字母)
 */
export const configInvalidProjectIdUppercase = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'A1B2C3D4E5F6789012345678901234AB',
  region: 'cn-north-1',
}

/**
 * 无效配置 - project_id格式错误(包含非十六进制字符)
 */
export const configInvalidProjectIdNonHex = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'g1h2i3j4k5l6789012345678901234mn',
  region: 'cn-north-1',
}

/**
 * 无效配置 - region格式错误
 */
export const configInvalidRegion = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'invalid-region',
}

/**
 * 无效配置 - endpoint格式错误(非HTTPS)
 */
export const configInvalidEndpointHTTP = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  endpoint: 'http://custom.myhuaweicloud.com',
}

/**
 * 无效配置 - endpoint格式错误(非URL)
 */
export const configInvalidEndpointNotURL = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  endpoint: 'not-a-url',
}

/**
 * 边缘案例 - 空字符串
 */
export const configEmptyStrings = {
  ak: '',
  sk: '',
  project_id: '',
  region: '',
}

/**
 * 边缘案例 - 特殊字符在可选字段中
 */
export const configSpecialCharsInOptional = {
  ak: 'ABCDEFGHIJKLMNOP1234',
  sk: '12345678901234567890123456789012',
  project_id: 'a1b2c3d4e5f6789012345678901234ab',
  region: 'cn-<script>alert("xss")</script>',
}
