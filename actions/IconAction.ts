import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import superagent from 'superagent';

import { IconInput } from '../commands/IconCommander';
import { exec } from '../utils';
import { AbstractAction } from './AbstractAction';

export class IconAction extends AbstractAction<IconInput>{
  async run(): Promise<void | null> {
    const filePath = this.getInputValue('filePath');
    if (!filePath){
      console.log(chalk.red('请指定iconfont地址'));
      return null;
    }
    if (!filePath.endsWith('.js')) {
      console.log(chalk.red('文件格式错误'));
      return null;
    }
    if(!filePath.startsWith('//')){
      console.log(chalk.red('路径前缀需是//'));
      return null
    }
    const operatePreFile = await this.iconFileCache();
    await operatePreFile('rename');

    const tempSplit = filePath.split('/');
    const fileName = tempSplit[tempSplit.length-1];
    const fontFilePath = path.resolve(process.cwd(), `public/${fileName}`);
    console.log(chalk.green('开始下载icon文件'))
    superagent
      .get(`https:${filePath}`)
      .end(function (err, sres) {
        if (err) {
          console.log(err);
          operatePreFile('back');
          return;
        }
        fs.writeFile(fontFilePath, sres.body, "binary", function (err) {
          if (err){
            operatePreFile('back');
            throw err;
          }
          console.log(chalk.green('下载成功'));
          const fontComponentPath = path.resolve(process.cwd(), `src/components/icon-font/index.tsx`);
          fs.readFile(fontComponentPath, 'utf8', function (err, data){
            if(err) {
              console.log(err);
              operatePreFile('back');
              return null;
            }
            const result = data.replace(/\/.*\.js/g, `/${fileName}`)
            fs.writeFile(fontComponentPath, result, 'utf8', err=>{
              if(err) {
                console.log(err);
                operatePreFile('back');
              } else {
                operatePreFile('delete');
                console.log('更新icon成功')
              }
            })
          })
        });
      });
  }

  async iconFileCache(){
    const publicPath = path.resolve(process.cwd(), 'public');
    const publicFiles = fs.readdirSync(publicPath);
    const preIconName = publicFiles.find(item=> item.startsWith('font_')) as string;
    return async (type = 'rename')=>{
      if(type === 'rename') {
        await exec(`mv ${path.resolve(publicPath, preIconName)} ${path.resolve(publicPath, `back_${preIconName}`)}`);
      } else if(type ==='delete') {
        await exec(`rm -rf ${path.resolve(publicPath, `back_${preIconName}`)}`);
      } else if(type === 'back') {
        await exec(`mv ${path.resolve(publicPath, `back_${preIconName}`)} ${path.resolve(publicPath, preIconName)}`);
      }
    }
  }
}
