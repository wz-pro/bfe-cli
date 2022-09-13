import { Command } from 'commander';

import { AbstractCommander } from './AbstractCommander';

export interface RollUpOption{
  input: string;
  watch: boolean;
  dev: boolean;
}

export class RollupCommander extends AbstractCommander<Object,RollUpOption>{
  load(program: Command) {
    program
      .command('components')
      .description('打包组件库')
      .option('-i | --input [input]', 'input file path')
      .option('-d | --dev', 'dev mode')
      .option('-w | --watch', 'watch mode')
      .action(async (options) => {
        await this.handle(options);
      });
  }
}