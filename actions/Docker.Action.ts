import chalk from 'chalk';
import fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';

import { IDockerInput, IDockerOptions } from '../commands/DockerCommander';
import { exec, getCachePath } from '../utils';
import { AbstractAction } from "./AbstractAction";

export class DockerAction extends AbstractAction<IDockerInput, IDockerOptions>{
    private readonly harborUrl = 'www.harbor.mobi';
    private dockerFilePath = '.';

    async run() {
        this.dockerFilePath = this.getOptionValue('dockerFile') || '.';
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        const packageJson = require(packageJsonPath);
        const { name, version } = packageJson;
        const questionList = [
            { type: 'rawlist', message: '请选择项目类型', name: 'type', choices: ['web', 'node'], default: 'web' },
        ];
        const { type } = await inquirer.prompt(questionList);
        const question = [
            { type: 'input', message: '请输入镜像名称', name: 'dockerName', default: name  },
            { type: 'input', message: '请输入版本号', name: 'dockerVersion', default: version },
            { type: 'input', message: '请输入harbor项目', name: 'projectName', default: 'bcs_dev' },
        ];
        const { dockerName, dockerVersion, projectName} = await inquirer.prompt(question);
        if(type==='web') await this.runWeb(dockerName, dockerVersion, projectName);
        if(type=== 'node') await this.runNode(dockerName, dockerVersion, projectName)
    }

    private async runWeb(dockerName:string, dockerVersion:string, projectName:string = 'bcs_dev'){
        const existsTemplate = fsExtra.existsSync(path.resolve(process.cwd(), 'nginx.template'));
        if(!existsTemplate){
            console.log(chalk.red('不存在 nginx.template, 请检查'));
            return null;
        }
        const existsDockerfile = DockerAction.checkDockerFile();
        if(!existsDockerfile) return null;

        const dockerBuildDir = path.resolve(getCachePath(), 'docker-build');
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        const dockerFileName = `${dockerName}.tar`
        const packageJson = await fsExtra.readJsonSync(packageJsonPath);
        let { version } = packageJson;
        version = dockerVersion || version;
        await exec('bcs run build');
        await exec(`docker build -t ${dockerName}:${version} .`);
        fsExtra.emptyDirSync(dockerBuildDir);
        fsExtra.ensureDirSync(dockerBuildDir);
        await exec(`docker save ${dockerName}:${version} > ${dockerBuildDir}/${dockerFileName}`);
        await exec(`docker login ${this.harborUrl} -u wangzhen  -p Y123456x`);
        await exec(`docker tag ${dockerName}:${version} ${this.harborUrl}/${projectName}/${dockerName}:${version}`);
        await exec(`docker push ${this.harborUrl}/${projectName}/${dockerName}:${version}`);
        console.log(chalk.green('打包成功!'));
    }

    private async runNode(dockerName:string, dockerVersion = 'latest', projectName = 'bcs_dev'){
        const existsDockerfile = DockerAction.checkDockerFile();
        if(!existsDockerfile) return null;
        await exec('npm run build');
        await exec(`docker build -t ${dockerName}:${dockerVersion} .`);
        await exec(`docker login ${this.harborUrl} -u wangzhen  -p Y123456x`);
        await exec(`docker tag ${dockerName}:${dockerVersion} ${this.harborUrl}/${projectName}/${dockerName}:${dockerVersion}`);
        await exec(`docker push ${this.harborUrl}/${projectName}/${dockerName}:${dockerVersion}`);
        console.log(chalk.green(`${dockerName}:${dockerVersion} 打包成功!`));
    }

    private static checkDockerFile(){
        const existsDockerfile = fsExtra.existsSync(path.resolve(process.cwd(), 'Dockerfile'));
        if(!existsDockerfile){
            console.log(chalk.red('不存在 Dockerfile, 请检查'));
            return false;
        }
        return true;
    }
}
