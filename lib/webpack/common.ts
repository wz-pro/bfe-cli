import AntdWebpackThemePlugin from 'antd-dynamic-theme-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { Configuration, RuleSetUse } from 'webpack';

import { BabelBuildType, getBabelConfig } from '../babel';
import { getPostCssConfig } from '../postcss';

const webpackBar = require('webpackbar');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const lessToJS = require('less-vars-to-js');
const PUBLIC_PATH = '/';

const themePath = path.resolve(process.cwd(), 'src/theme/theme.less');
const lightThemePath = path.resolve(process.cwd(), 'src/theme/light.less');
const darkThemePath = path.resolve(process.cwd(), 'src/theme/dark.less');

export const getIndexHtml = ()=>{
  const userPath =path.resolve(process.cwd(), 'public/index.html');
  return fs.existsSync(userPath)? userPath: path.resolve(__dirname, '../../templates/html/index.html');
}

export const getFavicon = ()=>{
  const userPath = path.resolve(process.cwd(), 'public/favicon.png');
  return fs.existsSync(userPath)? userPath: path.resolve(__dirname, '../../templates/html/favicon.svg')
}

const mergeColorValue = (one: any, two: any)=>{
  const oneResult = {...one};
  const twoResult = {...two};
  const oneKeys = Object.keys(one);
  const twoKeys = Object.keys(two);
  oneKeys.forEach(key=>{
    if(!twoKeys.includes(key)) twoResult[key] = oneResult[key];
  })
  twoKeys.forEach(key=>{
    if(!oneKeys.includes(key)) oneResult[key] = twoResult[key];
  })
  return [oneResult, twoResult];
}

export const getThemeValue = async ()=>{
  const getV = (path:string)=> {
    if(!fs.existsSync(path)) return {};
    return lessToJS(fs.readFileSync(path, 'utf8'),
      {stripPrefix: true, resolveVariables: true});
  }
  const themeVariables =  getV(themePath);
  let light = getV(lightThemePath);
  let dark = getV(darkThemePath);
  [light, dark] = mergeColorValue(light, dark);
  return {light, dark, themeVariables};
}

const basePath = process.cwd();

const postCssLoader = {
    loader: require.resolve('postcss-loader'),
    options: {
      postcssOptions: getPostCssConfig()
    },
};

export const getCommonConfig = async (config:any, type:string): Promise<Configuration>=>{
  const entry = config.entryFile || path.resolve(basePath, 'src/main.tsx');
  const babelConfig = getBabelConfig(BabelBuildType.UMD, /.(ts|tsx)$/.test(entry));
  const babelLoaderOptions = {
    ...babelConfig,
    plugins: [
      ...babelConfig.plugins,
    ],
    cacheDirectory: true,
  };

  const {theme = false} = config;
  const { peerDependencies, dependencies } = require(path.resolve(process.cwd(), 'package.json'))
  const withAntd = peerDependencies?.antd || dependencies?.antd
  const cssLoaders = [require.resolve('css-loader'), postCssLoader];
  cssLoaders.unshift(type === 'prod'? MiniCssExtractPlugin.loader : require.resolve('style-loader'))
  const lessLoaders: RuleSetUse= [
    ...cssLoaders,
    {
      loader: require.resolve('less-loader'),
    },
  ];
  return {
    entry: {
      main: entry
    },
    output: {
      path: path.resolve(basePath, 'dist'),
      publicPath: PUBLIC_PATH,
      filename: '[name].js',
      globalObject: 'this',
    },
    cache: {
      type: 'filesystem',
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          use: [
            require.resolve('thread-loader'),
            {
              loader: require.resolve('babel-loader'),
              options: babelLoaderOptions
            },
          ],
          exclude: path.resolve(basePath, 'node_modules'),
          include: path.resolve(basePath, 'src'),
        },
        {
          // .css 解析
          test: /\.css$/,
          use: cssLoaders,
        },
        {
          // .less 解析
          test: /\.less$/,
          use: lessLoaders,
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: babelLoaderOptions
            },
            {
              loader: require.resolve('@svgr/webpack'),
              options: {
                babel: false,
                icon: true,
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          include: path.resolve(basePath, 'src'),
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 8192,
                name: 'assets/[name].[hash:4].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(basePath, 'public'),
            to: './',
            globOptions: {
              ignore: ['**/favicon.png', '**/index.html'],
            },
            noErrorOnMissing: true,
          },
        ],
      }),
      new webpackBar(),
      ...(withAntd? [new AntdDayjsWebpackPlugin()]:[]),
      ...(withAntd&&theme? [new AntdWebpackThemePlugin({})]:[]),
    ],
    resolve: {
      alias: {
        '@': path.resolve(basePath, 'src'),
      },
      modules: [
        path.join(basePath, 'src'),
        path.join(basePath, 'theme'),
        path.join(basePath, 'node_modules')
      ],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.css'],
    },
  }
}
