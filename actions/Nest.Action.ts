import 'reflect-metadata';

import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';

import { NestInput, NestOption } from '../commands/NestCommander';
import { NestLib } from '../lib/nest';
import { firstUpperCase } from '../utils';
import { AbstractAction } from './AbstractAction';

export class NestAction extends AbstractAction<NestInput, NestOption> {
  async run(): Promise<void | null> {
    const module = this.getInputValue('module');
    const entity = this.getOptionValue('entity');
    if(!entity || !module) return null;
    await this.createSrcFile(module);
    const columns = await this.readEntity(module);
    const nestLib = new NestLib(columns, module);
    await nestLib.createDtoFiles();
  }

  private async readEntity(module: string) {
    console.log(chalk.green(`start read ${module} ...`));
    const basePath = `dist/entity/${module}.entity.js`
    const entityPath = path.resolve(process.cwd(), basePath);
    if(!fs.existsSync(entityPath)){
      throw new Error(`文件不存在：${basePath}`)
    }
    const ExportClass = await import(entityPath);
    const EntityClass = ExportClass[Object.keys(ExportClass)[0]];
    return this.getTargetProperties(EntityClass);
  }

  private getTargetProperties(target: any):any[]{
    const allColumns = (global as any).typeormMetadataArgsStorage.columns;
    const filterColumns = allColumns.filter((item:any)=> item.target === target);
    let childColumns = [];
    if(target.prototype?.__proto__) {
      childColumns = this.getTargetProperties(target.prototype.__proto__.constructor);
    }
    return [...filterColumns, ...childColumns]
  }

  private async createSrcFile(module:string){
    const modulePath = path.resolve(process.cwd(), 'src', module);
    if(!fs.existsSync(path.resolve(process.cwd(), 'src'))){
      throw new Error('请在项目根目录执行')
    }
    if(fs.existsSync(modulePath)){
      throw new Error(`${module} 已存在`)
    }
    fs.mkdirSync(modulePath);
    const fromBase = path.resolve(__dirname, '../templates/nest-template');
    const operates = ['controller', 'module', 'service'].map(type=>(
      {from: path.resolve(fromBase, `nest.${type}.ts`), to: path.resolve(modulePath, `${module}.${type}.ts`)}
    ))
    for (const {from, to} of operates){
      await this.writeFile(from, to, module);
    }
    console.log(chalk.green(`${module} 创建完成`));
  }

  private async writeFile(fromPath:string, toPath:string, moduleName:string){
    const output = fs.createWriteStream(toPath);
    return new Promise((resolve, reject)=>{
      try {
        const rl = readline.createInterface({
          input: fs.createReadStream(fromPath),
          output,
          terminal: false
        })
        rl.on('line', async line=>{
          let newLine = line.replace(/\$MODULE_NAME_TOP/g, firstUpperCase(moduleName));
          newLine = newLine.replace(/\$MODULE_NAME/g, moduleName);
          output.write(newLine+os.EOL);
        }).on('close', ()=>{
          resolve(true)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

}
