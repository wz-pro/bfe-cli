import { Command } from "commander";

import { DockerAction } from '../actions/Docker.Action';
import { IconAction } from '../actions/IconAction';
import { NestAction } from '../actions/Nest.Action';
import { RollupAction } from '../actions/RollupAction';
import { WebpackAction } from '../actions/WebpackAction';
import { DockerCommander } from './DockerCommander';
import { IconCommander } from './IconCommander';
import { NestCommander } from './NestCommander';
import { RollupCommander } from './RollupCommander';
import { WebpackCommander } from './WebpackCommander';

export default class Commander  {

  public static load(program: Command): void {
    new DockerCommander(new DockerAction()).load(program);
    new WebpackCommander(new WebpackAction()).load(program);
    new IconCommander(new IconAction()).load(program);
    new NestCommander(new NestAction()).load(program);
    new RollupCommander(new RollupAction()).load(program);
    program.parse(process.argv);
  }

}
