#! /usr/bin/env node
import {Command} from "commander";

import CommandLoader from '../commands';

const bootstrap = () => {
  const program = new Command();
  program
    .version(
      require('../package.json').version,
      '-v, --version',
      'Output the current version.',
    )
    .usage('<command> [options]')
    .helpOption('-h, --help', 'Output usage information.');

    CommandLoader.load(program);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
};

bootstrap();
