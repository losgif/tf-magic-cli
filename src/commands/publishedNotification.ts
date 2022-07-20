import axios from 'axios'
import { Arguments, CommandModule } from 'yargs'

type Options = {
  webhook?: string
}

const sendMentionMessage = async (webhook?: string) => {
  if (!webhook) {
    return Promise.reject('Webhook未配置')
  }

  const crmWebUrl = 'https://osstest.tf56.com/crm'

  const message = {
    "msgtype": "markdown",
    "markdown": {
      "content": `**CRM前端**项目已发布测试环境，[前往查看！](${crmWebUrl})`
    }
  }

  const response = await axios.post(webhook, message)

  console.log('response.data', response.data)

  return response
}

const module: CommandModule = {
  command: 'published-notification',
  describe: '🪧 发布通知',
  builder: (yargs) => yargs
    .options({
      webhook: {
        describe: '企业微信通知地址',
        demandOption: true,
        type: 'string'
      }
    }),
  handler: async (args: Arguments<Options>) => {
    await sendMentionMessage(args.webhook)
  }
}

export default module
