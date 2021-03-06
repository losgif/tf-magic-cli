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
  desc: 'ð çæAPIæ¥å£æä»¶',
  builder: (yargs) =>
    yargs
      .options({
        host: {
          alias: 'H',
          describe: 'æ¥å£æä»¶æç®¡åå',
          type: 'string'
        },
        config: {
          alias: 'c',
          describe: 'éç½®æä»¶å°å',
          type: 'string'
        },
        template: {
          alias: 't',
          describe: 'æ¨¡æ¿æä»¶å°å',
          type: 'string'
        },
        outputDir: {
          alias: 'o',
          describe: 'è¾åºç®å½',
          type: 'string'
        }
      }),
  handler: async (argv: Arguments<Options>) => {
    const url = argv.host ?? 'https://osstest.tf56.com'
    const config = argv.config ?? 'openapi.generator.config.json'
    const template = argv.template ?? 'src/templates/typescript-axios'
    const outputDir = argv.outputDir ?? 'src'

    let spinner = ora(`æ­£å¨ä» ${ url } å¤å è½½APIæä»¶\n`).start()

    axios.get(`${ url }/teamWorkApi/v2/api-docs`)
      .then(({ data: swagger }) => {
        spinner.text = 'ð¨ æ­£å¨å¤çæ°æ®\n'

        for (const pathsKey in swagger.paths) {
          const path = swagger.paths[pathsKey]

          for (const pathKey in path) {
            path[pathKey].operationId = path[pathKey].operationId.replace(/Using(GET|POST)_?\d?/, '')
            path[pathKey].operationId = path[pathKey].operationId.replace(/_\d/, '')
          }
        }

        spinner.text = 'âï¸ æ°æ®åå¥ä¸­...\n'
        const swaggerBuffer = Buffer.from(JSON.stringify(swagger))

        fs.writeFile('swagger.json', swaggerBuffer, err => {
          if (err) {
            spinner.fail('swagger æä»¶çæå¤±è´¥')
            process.stdout.write(chalk.red('åå¥æä»¶å¤±è´¥\n'))
            process.exit(1)
          }

          spinner.succeed('swagger æä»¶å·²çæ')
          spinner = ora(`â³ å¼å§çæAPIæä»¶\n`).start()

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
            shell: true,
            cwd: process.cwd()
          })

          openapi.stdout.on('data', (data) => {
            console.log(data.toString())
          })

          openapi.stdout.on('error', err => {
            console.error(err)
          })

          openapi.stdout.on('close', () => {
            spinner.succeed('APIæä»¶çæå®æ¯\n')
          })
        })
      })
      .catch(error => {
        spinner.stop()
        console.log(error)
        process.stdout.write(chalk.red('æ¥å£æä»¶è·åå¤±è´¥\n'))
        process.exit(1)
      })
  }
}

export default module
