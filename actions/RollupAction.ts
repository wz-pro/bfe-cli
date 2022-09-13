import chalk from 'chalk';
import { OutputOptions, rollup, RollupOptions } from 'rollup';

import { RollUpOption } from '../commands/RollupCommander';
import { BabelBuildType } from '../lib/babel';
import { getRollupConfig } from '../lib/rollup';
import { AbstractAction } from './AbstractAction';


export class RollupAction extends AbstractAction<Object, RollUpOption>{
  getUserConfig(){
  }

  async run() {
    const dev = this.getOptionValue('dev');
    dev? this.runDev():this.runPro();
  }

  async runDev(){
    const watch = this.getOptionValue('watch') as boolean;
    const inputFilePath = this.getOptionValue('input') as string;
    const types = [BabelBuildType.UMD, BabelBuildType.ESM, BabelBuildType.CJS]
    for(const type of types){
      console.log(chalk.green(`start build ${type}`));
      const config: RollupOptions = await getRollupConfig({ watch, inputFilePath, type })
      const {output, ...options}= config;
      const bundle = await rollup(options);
      await bundle.write(output as OutputOptions);
      console.log(chalk.green(`build ${type} success`));
    }
  }

  async runPro(){}

}