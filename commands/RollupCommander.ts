import { Command } from 'commander';

import { AbstractCommander } from './AbstractCommander';

export enum RollupProjectType {
  NODE='node',
  COMPONENT='components'
}

export interface RollUpOption{
  input: string;
  dev: boolean;
  type: RollupProjectType
}

export class RollupCommander extends AbstractCommander<Object,RollUpOption>{
  load(program: Command) {
    program
      .command('rollup')
      .description('rollup 打包')
      .option('-i | --input [input]', 'input file path')
      .option('-d | --dev', 'dev mode')
      .option('-t | --type [type]', 'node or components', 'components')
      .action(async (options) => {
        await this.handle(options);
      });
  }
}