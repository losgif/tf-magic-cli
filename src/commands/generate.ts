import axios from 'axios'
import chalk from 'chalk'
import * as child_process from 'child_process'
import * as fs from 'fs'
import ora from 'ora'
import { Arguments } from 'yargs'

type Options = {
  host?: string | undefined
  config?: string | undefined
  template?: string | undefined
  outputDir?: string | undefined
}

const module = {
  command: 'generate',
  desc: '📃 生成API接口文件',
  builder: (yargs) =>
    yargs
      .options({
        host: {
          alias: 'H',
          describe: '接口文件托管域名',
          type: 'string'
        },
        config: {
          alias: 'c',
          describe: '配置文件地址',
          type: 'string'
        },
        template: {
          alias: 't',
          describe: '模板文件地址',
          type: 'string'
        },
        outputDir: {
          alias: 'o',
          describe: '输出目录',
          type: 'string'
        }
      }),
  handler: async (argv: Arguments<Options>) => {
    const url = argv.host ?? 'https://osstest.tf56.com'
    const config = argv.config ?? 'openapi.generator.config.json'
    const template = argv.template ?? 'src/templates/typescript-axios'
    const outputDir = argv.outputDir ?? 'src'

    let spinner = ora(`正在从 ${ url } 处加载API文件\n`).start()

    axios.get(`${ url }/teamWorkApi/v2/api-docs`)
      .then(({ data: swagger }) => {
        spinner.text = '🔨 正在处理数据\n'

        for (const pathsKey in swagger.paths) {
          const path = swagger.paths[pathsKey]

          for (const pathKey in path) {
            path[pathKey].operationId = path[pathKey].operationId.replace(/Using(GET|POST)_?\d?/, '')
            path[pathKey].operationId = path[pathKey].operationId.replace(/_\d/, '')
          }
        }

        spinner.text = '✍️ 数据写入中...\n'
        const swaggerBuffer = Buffer.from(JSON.stringify(swagger))

        fs.writeFile('swagger.json', swaggerBuffer, err => {
          if (err) {
            spinner.fail('swagger 文件生成失败')
            process.stdout.write(chalk.red('写入文件失败\n'))
            process.exit(1)
          }

          spinner.succeed('swagger 文件已生成')
          spinner = ora(`⏳ 开始生成API文件\n`).start()

          const openapi = child_process.spawn('openapi-generator-cli', [
            'generate',
            '--skip-validate-spec',
            '-i',
            'swagger.json',
            '-c',
            config,
            '-g',
            'typescript-axios',
            '-t',
            template,
            '-o',
            outputDir
          ], {
            cwd: process.cwd()
          })

          openapi.stdout.on('data', (data) => {
            console.log(data.toString())
          })

          openapi.stdout.on('error', err => {
            console.error(err)
          })

          openapi.stdout.on('close', () => {
            spinner.succeed('API文件生成完毕\n')
          })
        })
      })
      .catch(error => {
        spinner.stop()
        console.log(error)
        process.stdout.write(chalk.red('接口文件获取失败\n'))
        process.exit(1)
      })
  }
}

export default module
