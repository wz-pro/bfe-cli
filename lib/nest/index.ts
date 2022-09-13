import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { exec, firstUpperCase, writeAsync } from '../../utils/index';

export class NestLib {

  private baseDtoNames: string[] = [];
  private dtoDir = path.resolve(process.cwd(), `src/${this.moduleName}/dto`);

  constructor(private columns:any[], private moduleName:string) {
  }

  async getBaseDtoNames(){
    const baseDtoPath = path.resolve(process.cwd(), 'dist/base/BaseDto.js');
   if(!fs.existsSync(baseDtoPath)){
     throw new Error('不存在:'+ baseDtoPath);
   }
    const dtoExport = await import(baseDtoPath);
    const BaseDtoClass = dtoExport[Object.keys(dtoExport)[0]];
    const allProperties = (global as any).classValidatorMetadataStorage.getTargetValidationMetadatas(BaseDtoClass)
    const allNames = new Set(allProperties.map((item:any)=>item.propertyName));
    return [...allNames] as string[];
  }

  async createDtoFiles(){
    this.baseDtoNames =await this.getBaseDtoNames();
    await exec(`mkdir -p ${this.dtoDir}`);
    await this.createCreateDto();
    await this.createListQueryDto();
    await this.createQueryDto();
    await this.createUpdateDto();
    try {
      console.log(chalk.green('开始格式化代码...'))
      await exec(`npx eslint ${this.dtoDir} --fix`)
      console.log(chalk.green('格式化完成'))
      console.log(chalk.green(`${this.moduleName} 初始化完成!`))
    } catch (e) {
      console.log(e);
    }
  }

  async createCreateDto(){
    const imports:string[] = [
      `import { BaseDto } from '../../base/BaseDto';`,
    ];
    const classHeader:string[] = [
      `export class Create${firstUpperCase(this.moduleName)}Dto extends BaseDto {`
    ];
    const classBody:string[] = [];
    const classEnd = ['}'];
    let hasNull = false;
    this.columns.forEach(item=>{
      const { propertyName:name, options:{nullable = true, primary = false } } = item;
      if(this.baseDtoNames.includes(name)) return null;
      if(!nullable && !primary){
        if(!hasNull){
          imports.push(`import { IsNotEmpty } from 'class-validator';`)
          hasNull = true
        }
        classBody.push(
          `
            @IsNotEmpty()
            ${name}:string
          `
        )
      } else if(!primary){
        classBody.push(`${name}?:string`)
      }
    })
    const createFileName = `create.${this.moduleName}.dto.ts`;
    await this.writeFile(
      [imports, classHeader, classBody, classEnd],
      path.resolve(this.dtoDir, createFileName)
    )
    console.log(chalk.green(`创建${createFileName}成功`));
  }

  async createListQueryDto(){
    const imports = [
      `import { BasePageNation } from '../../base/BasePageNation';`
    ];
    const header = [
      `export class ${firstUpperCase(this.moduleName)}ListQueryDto extends BasePageNation {`
    ];
    const body:string[] = [];
    const end = [`}`];
    this.columns.map(item=>{
      const { propertyName } = item;
      body.push(`readonly ${propertyName}?: string`)
    })
    const listQueryDtoName = `${this.moduleName}.list.query.dto.ts`;
    await this.writeFile(
      [imports, header, body, end],
      path.resolve(this.dtoDir, listQueryDtoName)
    )
    console.log(chalk.green(`创建${listQueryDtoName}成功`));
  }

  async createQueryDto(){
    const imports = [
      `import { IsNotEmpty } from 'class-validator';`
    ];
    const header = [
      `export class ${firstUpperCase(this.moduleName)}QueryDto {`,
    ];
    const body:string[] = [];
    const end = ['}'];
    const primaryColumns = this.columns.filter(column=>column.options.primary)
    primaryColumns.forEach(column=>{
      body.push(`
      @IsNotEmpty()
      readonly ${column.propertyName}:string
      `)
    })
    const fileName = `${this.moduleName}.query.dto.ts`;
    await this.writeFile([imports, header, body, end], path.resolve(this.dtoDir,fileName));
    console.log(chalk.green(`创建${fileName}成功`));
  }

  async createUpdateDto() {
    const imports = [
      `import { IsNotEmpty } from 'class-validator';`
    ];
    const header = [`export class Update${firstUpperCase(this.moduleName)}Dto {`];
    const body:string[] = [];
    const end = ['}'];
    this.columns.forEach(item=>{
      const { propertyName:name, options:{ primary = false } } = item;
      body.push(`
       ${primary? `@IsNotEmpty()`: ''}
       readonly ${name}${!primary? '?':''}: string;
      `)
    })
    const fileName = `update.${this.moduleName}.dto.ts`;
    await this.writeFile([imports, header, body, end], path.resolve(this.dtoDir,fileName));
    console.log(chalk.green(`创建${fileName}成功`));
  }

  async writeFile(content: string[][], filePath: string){
    const output = fs.createWriteStream(filePath);
    for(const module of content){
      for(const line of module){
        await writeAsync(output, line+os.EOL);
      }
      await writeAsync(output, os.EOL);
    }
    output.close();
  }
}
