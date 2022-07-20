import chalk from 'chalk'
import { execSync } from 'child_process'
import { Arguments, CommandModule } from 'yargs'

type Options = {
  domain?: string
}

function getUserEmail () {
  return execSync('git config user.email').toString('utf8').trim();
}

function checkUserEmail (domain: string, userEmail: string) {
  if (!userEmail) {
    return false;
  }
  const emails = domain && domain.replace(' ', '').split(',').reduce((pre, email) => `${ pre }|${ email.toLowerCase() }`)
  const regex = new RegExp(`(.*)@(${emails})$`)
  return regex.test(userEmail)
}

const module: CommandModule = {
  command: 'git-check',
  describe: '💻 Git 检查',
  builder: (yargs) => yargs
    .options({
      domain: {
        alias: 'd',
        describe: '邮箱域,使用逗号分割多个邮箱域',
        demandOption: true,
        type: 'string'
      }
    }),
  handler: async (args: Arguments<Options>) => {
    const userEmail = getUserEmail()
    const domain = args.domain

    if (!domain) {
      process.stdout.write(chalk.red('You need to pass domain as argument to husky-check-email!\n'));
      process.exit(1);
    }

    if (!userEmail) {
      process.stdout.write(chalk.red('No email to check! Please provide email to check in `git config user.email`!\n'))
      process.exit(1);
    }

    if (!checkUserEmail(domain, userEmail)) {
      process.stdout.write(chalk.red(`You need to commit with ${ domain } email\n`))
      process.stdout.write(`Your email is set to "${ userEmail }"\n`);
      process.stdout.write('You can fix this with following command:\n');
      process.stdout.write(`\`git config user.email <your_name>@${ domain }\`\n`);
      process.exit(1);
    }
  }
}

export default module
