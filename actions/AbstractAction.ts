import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

interface Input<T, K extends keyof T> {
  label: K;
  value: T[K];
}

type PickInput<T, K extends keyof T> = {
  [P in K]: Input<T, P>
};

export type InputParams<T> = PickInput<T, keyof T>[keyof T][];

export abstract class AbstractAction<I extends Object = Object, O extends Object = Object> {
  private inputs: InputParams<I>= [];
  private options: InputParams<O> = [];

  async handle(inputs: InputParams<I>, options: InputParams<O>){
    this.inputs = inputs;
    this.options = options;
    await this.run();
  }

  abstract run():Promise<void|null>;

  async checkNpmRoot(){
    const isRoot = fs.existsSync(path.resolve(process.cwd(), 'package.json'))
    if(!isRoot){
      console.log(chalk.red('请在项目根目录下执行当前命令'));
      throw new Error('请在项目根目录下运行');
    }
    return isRoot;
  }

  getStoreValue<P, k extends keyof P>(key: k, values: InputParams<P>){
    const item = values.find(one=> one.label === key);
    return item?.value;
  }

  getInputValue(key: keyof I){
    return this.getStoreValue<I, typeof key>(key, this.inputs);
  }

  getOptionValue(key: keyof O){
    return this.getStoreValue<O, typeof key>(key, this.options);
  }
}
