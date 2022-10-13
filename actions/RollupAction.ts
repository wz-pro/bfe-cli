import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { OutputOptions, rollup, RollupOptions, watch } from 'rollup';

import {RollUpOption, RollupProjectType} from '../commands/RollupCommander';
import { BabelBuildType } from '../lib/babel';
import { getRollupConfig } from '../lib/rollup';
import {AllConfigs} from "../lib/rollup/index";
import { AbstractAction } from './AbstractAction';


const getDefaultInput = (cwd: string = process.cwd())=>{
  return [
    path.resolve(cwd, 'src/index.ts'),
    path.resolve(cwd, 'src/index.tsx'),
    path.resolve(cwd, 'src/index.js'),
    path.resolve(cwd, 'src/index.jsx'),
    path.resolve(cwd, 'index.ts'),
    path.resolve(cwd, 'index.tsx'),
    path.resolve(cwd, 'index.js'),
    path.resolve(cwd, 'index.jsx'),
  ].find(fs.existsSync) || '';
}

function checkIsTsFile(path:string){
  return /\.(ts|tsx)$/.test(path);
}

type FormatConfig = Omit<AllConfigs, 'type'> & {dev: boolean}

export class RollupAction extends AbstractAction<Object, RollUpOption>{
  getUserConfig(){
  }

  async run() {
    const dev = this.getOptionValue('dev') as boolean;
    const projectType = this.getOptionValue('type') as RollupProjectType;
    const isLerna = fs.existsSync(path.resolve(process.cwd(), 'lerna.json'));
    const inputFilePath = this.getOptionValue('input') as string || getDefaultInput();
    const isNode = projectType === RollupProjectType.NODE;
    const isTs = checkIsTsFile(inputFilePath);
    const baseConfigs: FormatConfig = {
      dev,
      inputFilePath,
      watch: dev,
      isNode,
      cwd: process.cwd(),
      isLerna,
      isTs
    }
    return isLerna? this.solveLerna(baseConfigs): this.packageItem(baseConfigs);
  }

  async solveLerna(configs: FormatConfig){
    const dirs = fs.readdirSync(path.resolve(process.cwd(), 'packages'))
    for( const itemDir of dirs){
      const itemCwdPath = path.resolve(process.cwd(), `packages/${itemDir}`);
      const filePath = getDefaultInput(itemCwdPath);
      await this.packageItem({
        ...configs,
        isTs: checkIsTsFile(filePath),
        cwd: itemCwdPath,
        inputFilePath: filePath
      })
    }
  }

  async packageItem(configs: FormatConfig){
    const { isNode, dev } = configs;
    const types = isNode ? [
      BabelBuildType.ESM, BabelBuildType.CJS
    ]:[BabelBuildType.UMD, BabelBuildType.ESM, BabelBuildType.CJS]

    for(const type of types){
      console.log(chalk.green(`start build ${type}`));
      console.log(chalk.green(`inputFile ${configs.inputFilePath}`));
      const config: RollupOptions = await getRollupConfig({...configs, type})
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