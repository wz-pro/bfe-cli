import { Command } from 'commander';
import * as path from 'path';

import { AbstractCommander } from './AbstractCommander';

export interface IDockerInput{
}

export interface IDockerOptions{
  dockerFile: string;
}

export class DockerCommander extends AbstractCommander<IDockerInput, IDockerOptions>{
  load(program: Command){
    program
      .command('docker')
      .description('项目打包docker')
      .option('-d, --dockerFile', 'Dockerfile Path',  path.resolve(process.cwd(), 'Dockerfile'))
      .action(async (cmd: IDockerOptions)=> {
        await this.handle(cmd);
      })
  }
}
