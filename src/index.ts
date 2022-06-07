#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import compile from './commands/compile.js';
import generate from './commands/generate.js'
import gitCheck from './commands/gitCheck.js'

yargs(hideBin(process.argv))
  // Use the command to scaffold.
  .command(compile)
  .command(generate)
  .command(gitCheck)
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: 'help', v: 'version' })
  .argv;
