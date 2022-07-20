#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import compile from './commands/compile.js';
import generate from './commands/generate.js'
import gitCheck from './commands/gitCheck.js'
import publishedNotification from './commands/publishedNotification.js'

console.log('process.argv', process.argv)

yargs(hideBin(process.argv))
  // Use the command to scaffold.
  .command(compile)
  .command(generate)
  .command(gitCheck)
  .command(publishedNotification)
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: 'help', v: 'version' })
  .argv;
