export interface OptionsType {
  name: string
  version: string

  // 华为云ProjectMan配置
  /**
   * 华为云访问密钥ID (Access Key)
   * 可通过环境变量 HUAWEICLOUD_SDK_AK 或 HUAWEI_CLOUD_AK 提供
   */
  ak?: string

  /**
   * 华为云秘密访问密钥 (Secret Key)
   * 可通过环境变量 HUAWEICLOUD_SDK_SK 或 HUAWEI_CLOUD_SK 提供
   */
  sk?: string

  /**
   * 华为云项目ID
   * 可通过环境变量 HUAWEICLOUD_SDK_PROJECT_ID 或 HUAWEI_CLOUD_PROJECT_ID 提供
   */
  project_id?: string

  /**
   * 华为云区域标识符
   * 例如: 'cn-north-1', 'cn-north-4', 'ap-southeast-1'
   * @default 从环境变量或 'cn-north-1'
   */
  region?: string

  /**
   * 自定义服务终端节点 URL
   * 例如: 'https://projectman.cn-north-4.myhuaweicloud.com'
   * 优先级高于 region
   */
  endpoint?: string
}
