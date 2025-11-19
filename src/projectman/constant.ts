/**
 * Work Hour Types defined by HuaweiCloud ProjectMan
 * These are the predefined work hour type IDs (21-34) used when adding work hours to issues
 */
export const WORK_HOUR_TYPES: Record<number, string> = {
  21: '研发设计',
  22: '后端开发',
  23: '前端开发(Web)',
  24: '前端开发(小程序)',
  25: '前端开发(App)',
  26: '测试验证',
  27: '缺陷修复',
  28: 'UI设计',
  29: '会议',
  30: '公共事务',
  31: '培训',
  32: '研究',
  33: '其它',
  34: '调休请假',
}

export type WorkHourTypeId = keyof typeof WORK_HOUR_TYPES

/**
 * Tracker Types (Work Item Types) defined by HuaweiCloud ProjectMan
 * These are the predefined tracker type IDs used when filtering issues
 */
export const TRACKER_TYPES: Record<number, string> = {
  2: 'Task',
  3: 'Bug',
  7: 'Story',
}

export type TrackerTypeId = keyof typeof TRACKER_TYPES

/**
 * Issue Status Types defined by HuaweiCloud ProjectMan
 * These are the predefined status IDs used when filtering issues
 */
export const STATUS_TYPES: Record<number, string> = {
  1: '新需求',
  2: '进行中',
  3: '已解决',
  4: '测试中',
  5: '已关闭',
  6: '已拒绝',
}

export type StatusTypeId = keyof typeof STATUS_TYPES

/**
 * Priority Types defined by HuaweiCloud ProjectMan
 * These are the predefined priority IDs used when filtering issues
 */
export const PRIORITY_TYPES: Record<number, string> = {
  1: '低',
  2: '中',
  3: '高',
  4: '紧急',
}

export type PriorityTypeId = keyof typeof PRIORITY_TYPES

/**
 * Domain Types defined by HuaweiCloud ProjectMan
 * These are the predefined domain IDs used when filtering issues
 */
export const DOMAIN_TYPES: Record<string, string> = {
  '2c206d96d2714ec8ac93ecb2ef5393e1': '性能',
  '5c6d2b5437b94bb59dd18ecf57cbe379': '可靠性',
  e7e75ceefc714b2cacd689a8850df409: '可用性',
  '0fb6908fe3aa4947841c14d412358c67': 'AI',
  '4842f562c4d4421182cebcd541a252c9': 'BI',
  b5275dd981e34dcb9513bf4e26ba69c7: 'SaaS',
  '3bc0f74b47404bdb81070f7b348c36d9': 'PaaS',
  c06274f6465a417ea20b4b33d5dec935: 'UED',
  '7173fdbf382c44bd93b71783185747d9': '技术演进',
  '03365d1de96f4dc0b989256a5fb24fda': '项目开发',
}

export type DomainTypeId = keyof typeof DOMAIN_TYPES

/**
 * Custom Field Types defined by HuaweiCloud ProjectMan
 * These are the custom fields configured for the project
 */
export interface CustomFieldDefinition {
  customField: string
  type: string
  name: string
  options: string[] | null
}

export const CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    customField: 'custom_field32',
    type: 'checkbox',
    name: '缺陷技术分析',
    options: [
      '功能实现问题',
      '需求变更问题',
      '历史遗留问题',
      '代码逻辑问题',
      '用户界面问题',
      '接口问题',
      '数据问题',
      '性能问题',
      '环境问题',
      '兼容性问题',
      '产品设计问题',
      '优化建议问题',
      '技术引起的需求变更问题',
      '其他问题',
    ],
  },
  {
    customField: 'custom_field39',
    type: 'textArea',
    name: '问题原因及解决办法',
    options: null,
  },
  {
    customField: 'custom_field29',
    type: 'radio',
    name: '引入阶段',
    options: ['历史版本', 'yyyyMM 格式，例如 202508'],
  },
]

export type CustomFieldId = string
