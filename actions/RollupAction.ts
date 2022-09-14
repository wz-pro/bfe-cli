import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { OutputOptions, rollup, RollupOptions, watch } from 'rollup';

import {RollUpOption, RollupProjectType} from '../commands/RollupCommander';
import { BabelBuildType } from '../lib/babel';
import { getRollupConfig } from '../lib/rollup';
import { AbstractAction } from './AbstractAction';


const getDefaultInput = ()=>{
  const tsPath = path.resolve(process.cwd(), 'src/index.ts');
  const tsxPath = path.resolve(process.cwd(), 'src/index.tsx');
  if(fs.existsSync(tsPath)) return tsPath;
  if(fs.existsSync(tsxPath)) return tsxPath;
  return path.resolve(process.cwd(), 'index.ts');
}

export class RollupAction extends AbstractAction<Object, RollUpOption>{
  getUserConfig(){
  }

  async run() {
    const dev = this.getOptionValue('dev') as boolean;
    const projectType = this.getOptionValue('type') as RollupProjectType;
    const inputFilePath = this.getOptionValue('input') as string || getDefaultInput();

    const types = projectType=== RollupProjectType.NODE ? [
      BabelBuildType.ESM, BabelBuildType.CJS
    ]:[BabelBuildType.UMD, BabelBuildType.ESM, BabelBuildType.CJS]

    for(const type of types){
      console.log(chalk.green(`start build ${type}`));
      const config: RollupOptions = await getRollupConfig({
        watch: dev,
        inputFilePath,
        type,
        isNode: projectType === RollupProjectType.NODE
      })
      dev? await this.runWatch(type, config): await this.runBuild(config);
      console.log(chalk.green(`build ${type} success`));
    }
  }

  async runWatch(type: BabelBuildType, config: RollupOptions){
    const watcher = watch([config]);
    await (new Promise<void>((resolve) => {
      watcher.on('event', (event) => {
        if (event.code === 'ERROR') {
          console.log(chalk.red(event.error));
          resolve();
        } else if (event.code === 'BUNDLE_END') {
          console.log(chalk.green(`Build ${type} success`));
          resolve();
        }
      });
    }));
    process.once('SIGINT', () => {
      watcher.close();
    });
  }

  async runBuild(config: RollupOptions){
    const {output, ...options}= config;
    const bundle = await rollup(options);
    await bundle.write(output as OutputOptions);
  }

}