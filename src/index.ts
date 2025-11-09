#!/usr/bin/env node
import 'dotenv/config'
import yargs, { type ArgumentsCamelCase } from 'yargs'
import { hideBin } from 'yargs/helpers'
import pkg from '../package.json' with { type: 'json' }
import { getConfigSummary, getProjectManClient } from './projectman'
import { startStdioServer } from './services'
import { getHuaweiCloudConfig, getOptions } from './utils'

const name = 'huaweicloud-projectman-mcp'

const argv = await yargs()
  .scriptName(name)
  .usage('$0 <command> [options]')
  .command(
    'stdio',
    'Start the server using the stdio transport protocol.',
    () => {},
    argv => startServer('stdio', argv),
  )
  .option('ak', {
    type: 'string',
    description: 'Huawei Cloud Access Key',
  })
  .option('sk', {
    type: 'string',
    description: 'Huawei Cloud Secret Key',
  })
  .option('project-id', {
    type: 'string',
    description: 'Huawei Cloud Project ID',
  })
  .option('region', {
    type: 'string',
    description: 'Huawei Cloud Region (e.g., cn-north-1)',
  })
  .option('endpoint', {
    type: 'string',
    description: 'Custom API endpoint URL',
  })
  .help()
  .parse(hideBin(process.argv))

if (!argv._[0]) {
  startServer('stdio', argv)
}

async function startServer(mode: string, argv: ArgumentsCamelCase) {
  const options = getOptions(argv, {
    name,
    version: pkg.version,
  })

  // 初始化华为云ProjectMan客户端 (如果配置可用)
  try {
    const config = getHuaweiCloudConfig(options)

    // 只在配置了必需字段时才初始化客户端
    if (config.ak && config.sk && config.project_id) {
      const clientWrapper = getProjectManClient(config)
      const summary = getConfigSummary(config)

      console.log('[INFO] 华为云ProjectMan客户端初始化成功')
      console.log('[INFO] 配置摘要:', JSON.stringify(summary, null, 2))
      console.log('[INFO] 客户端创建时间:', new Date(clientWrapper.createdAt).toISOString())
    } else {
      console.warn('[WARN] 华为云配置不完整,客户端未初始化')
      console.warn('[WARN] 请通过命令行参数或环境变量提供 ak, sk, project_id')
    }
  } catch (error) {
    console.error('[ERROR] 华为云ProjectMan客户端初始化失败:', error)
    if (error instanceof Error) {
      console.error('[ERROR] 错误详情:', error.message)
    }
    process.exit(1)
  }

  if (mode === 'stdio') {
    startStdioServer(options).catch(console.error)
  }
}
