import { Command } from 'commander';

import { AbstractCommander } from './AbstractCommander';

export interface IconInput{
  filePath: string
}

export class IconCommander extends AbstractCommander<IconInput>{
  load(program: Command): void {
    program
      .command('icon <fPath>')
      .description('更新icon')
      .action(async(filePath)=>{
        await this.handle({}, {filePath} );
      })
  }
}
