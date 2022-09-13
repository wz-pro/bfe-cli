import chalk from "chalk";
import fs from 'fs';
import { WriteStream } from 'fs-extra';
import  http from 'http';
import path from 'path';
import  shelljs from 'shelljs';

export const exec = async (cmd = '')=>{
  if(!cmd) return false;
  return new Promise((resolve, reject)=>{
    shelljs.exec(cmd, function (code, stdout, stderr){
      if(code !==0){
        console.log(chalk.red(`执行${cmd}失败:`))
        reject(stderr);
      }
      resolve(stdout);
    })
  })
}

export function upload(host:string, port:number, path:string, Cookie:string, uploadFilePath:string) {
  return new Promise((resolve, reject)=>{
    const boundaryKey = '----' + new Date().getTime();    // 用于标识请求数据段
    const options = {
      host,
      port,
      method: 'POST',
      path: path,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Connection': 'keep-alive',
        'Cookie': Cookie,
      }
    };
    const req = http.request(options, function(res){
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        console.log('body: ' + chunk);
      });
      res.on('end', function() {
        console.log('res end.');
      });
    });
    req.write(
      `--${boundaryKey}rn Content-Disposition: form-data; name="file"; filename="myTest.jpg"rn Content-Type: application/x-msdownload`
    );

    // 创建一个读取操作的数据流
    const fileStream = fs.createReadStream(uploadFilePath);
    fileStream.pipe(req, {end: false});
    fileStream.on('end', function(error: Error) {
      req.end('rn--' + boundaryKey + '--');
      if(error){
        console.log(error);
        reject();
      } else resolve(true);
    });
  })
}

export const firstUpperCase = (str:string) => {
  return str.replace(str[0], str[0].toUpperCase());
}

export function writeAsync(output:WriteStream, content:string){
  return new Promise(((resolve, reject) => {
    output.write(content, (error => {
      if(error) reject(error);
      resolve(true);
    }))
  }))
}

export function getCachePath(){
  return path.resolve(process.cwd(), 'node_modules/.cache/bcs-tools');
}