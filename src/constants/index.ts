export const MagicSeparator = '###MAGIC###'

/**
 * Work Hour Types defined by HuaweiCloud ProjectMan
 * These are the predefined work hour type IDs (21-34) used when adding work hours to issues
 */
export const WORK_HOUR_TYPES = {
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
} as const

export type WorkHourTypeId = keyof typeof WORK_HOUR_TYPES
