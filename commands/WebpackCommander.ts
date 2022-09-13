import { Command } from 'commander';

import { AbstractCommander } from './AbstractCommander';

export interface WebpackInput{
  type: string;
}
export interface WebpackOption{
  port: string
  analyzer:boolean
}

export class WebpackCommander extends AbstractCommander<WebpackInput, WebpackOption>{
  load(program: Command) {
    program
      .command('run [type]', '', {})
      .option('-p | --port [port]', '端口号')
      .option('-a | --analyzer', '大小分析')
      .description('运行项目')
      .action(async (type='dev', option)=>{
        await this.handle(option, {type});
      })
  }

}
