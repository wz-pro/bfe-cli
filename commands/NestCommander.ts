import { Command } from 'commander';

import { AbstractCommander } from './AbstractCommander';

export interface NestInput {
  module: string;
}

export interface NestOption{
  entity: string;
}

export class NestCommander extends AbstractCommander<NestInput, NestOption>{
  load(program: Command): void {
    program
      .command('nest <module>')
      .option('-e | --entity [entity]', 'Entity Name')
      .description('创建module')
      .action(async (module, options: NestOption)=>{
        await this.handle(options, {module});
      })
  }
}
