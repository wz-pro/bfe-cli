import chalk from 'chalk';
import lodash from 'lodash';
import util from 'util';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import WebpackDevServer from 'webpack-dev-server';

import { WebpackInput, WebpackOption } from '../commands/WebpackCommander';
import { getDevConfig } from '../lib/webpack/dev';
import { getProdConfig } from '../lib/webpack/prod';
import { AbstractAction } from "./AbstractAction";
import { getThemeValue } from '../lib/webpack/common';
import path from "path";
import fs from 'fs';

const ENV = {
  dev: 'dev',
  prod: 'prod',
}

const bundlePlugins ={
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerPort: 9999,
    }),
  ]
};

export class WebpackAction extends AbstractAction<WebpackInput, WebpackOption>{
  async run(): Promise<void | null> {
    await this.checkNpmRoot();
    const type = this.getInputValue('type');
    const port = this.getOptionValue('port');
    const analyzer = !!this.getOptionValue('analyzer');
    if(type === 'dev'){
      await this.runDev(Number(port), analyzer);
    }
    if(type === 'build'){
      await this.runProd(analyzer);
    }
  }

  private async runDev(port: number, analyzer: boolean){
    const userConfig = await WebpackAction.getUserConfig(ENV.dev);
    const devConfig = await getDevConfig(userConfig);
    const { devServer:devServerConfig, ...otherConfig } = lodash.merge(devConfig, analyzer? bundlePlugins: {} )
    if(!devServerConfig) return;
    const config = await WebpackAction.formatConfig(otherConfig);
    const compiler = webpack(config);
    devServerConfig.port = Number(port) || devServerConfig.port;
    const server = new WebpackDevServer(devServerConfig, compiler);
    await server.start();
    console.log('dev server is running');
  }

  private async runProd(analyzer:boolean){
    const userConfig = await WebpackAction.getUserConfig(ENV.prod);
    const prodConfig = await getProdConfig(userConfig);
    const mergedConfig = lodash.merge(prodConfig, analyzer? bundlePlugins: {})
    const config = await WebpackAction.formatConfig(mergedConfig, ENV.prod);
    webpack(config, (err, stats)=>{
      WebpackAction.webpackCallBack(err, stats);
    })
  }

  private static async getUserConfig(type:string): Promise<webpack.Configuration>{
    const userConfigPath = path.resolve(process.cwd(), '.bcs.js');
    if(!fs.existsSync(userConfigPath)) return {};
    const config = await import(userConfigPath);
    const {dev, prod, ...common} = config;
    return {...config[type], ...common}
  }

  private static async formatConfig(config:any = {}, env = ENV.dev): Promise<webpack.Configuration>{
    const { args = {}, ...otherConfig } = config;
    const themeValue = await getThemeValue();
    const defineParams:any = {
      APP_ENV: JSON.stringify(env),
      BCS_THEME_DATA: JSON.stringify(themeValue)
    }
    Object.keys(args).forEach((key)=>{
      defineParams[key] = JSON.stringify(args[key]);
    })
    otherConfig.plugins.unshift(new webpack.DefinePlugin(defineParams));
    return otherConfig;
  }


  private static webpackCallBack(err:Error|undefined, stats:webpack.Stats| undefined){
    if(err){
      console.log(chalk.red(
        util.inspect(err, {showHidden: false, depth: null})));
      process.exit(1);
    }
    const info = stats?.toJson();
    if (stats?.hasErrors()) {
      info?.errors?.forEach(error => {
        console.error(chalk.red(
          util.inspect(error, {showHidden: false, depth: null})
        ));
      });
      process.exit(1);
    }

    if (stats?.hasWarnings()) {
      info?.warnings?.forEach(warning => {
        console.warn(chalk.yellow(
          util.inspect(warning, {showHidden: false, depth: null})
        ));
      });
    }
    console.log(stats?.toString({chunks: true, colors: true}))
  }
}
