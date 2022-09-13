import {Command} from "commander";

import { AbstractAction, InputParams } from '../actions/AbstractAction';

export abstract class AbstractCommander<I extends Object= Object, O extends Object= Object> {
  constructor(private action: AbstractAction<I, O>){}

  public abstract load(program: Command): void;

  private getValues<V extends I | O>(optionObj?: V):InputParams<V>{
    const options: InputParams<V> = [];
    if(!optionObj) return options;
    (Object.keys(optionObj) as ((keyof V) [])).forEach((key: keyof V)=>{
      options.push({ label: key, value: optionObj[key] })
    })
    return options;
  }

  private getOptions(optionObj?: O){
    return this.getValues<O>(optionObj);
  }

  private getInputs(inputObj?: I){
    return this.getValues<I>(inputObj);
  }

  public async handle(optionObj?: O, inputObj?: I){
    await this.action.handle(this.getInputs(inputObj), this.getOptions(optionObj));
  }
}
