import { DEFAULT_EXTENSIONS } from '@babel/core';
import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import autoprefixer from "autoprefixer";
import fs from 'fs';
import path from 'path';
import { InternalModuleFormat, Plugin, RollupOptions } from 'rollup';
import postcss from 'rollup-plugin-postcss';
import typescript  from 'rollup-plugin-typescript2';
import ts from 'typescript';

import { getCachePath } from '../../utils';
import { BabelBuildType, getBabelConfig } from '../babel';

const LessPlugin = require('less-plugin-npm-import');

interface PKG {
  main: string;
  module: string;
  peerDependencies: {[key:string]: string}
  name: string;
}

interface rollupConfigParams{
  inputFilePath: string;
  watch: boolean;
  type: BabelBuildType;
  isNode: boolean;
}

export interface AllConfigs extends rollupConfigParams{
  cwd: string
  isTs: boolean
  isLerna: boolean
}

const babelExtensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx'];

const getPlugins = ({type, isTs = false, isNode = false, cwd, isLerna, watch }: AllConfigs): Plugin[]=>{
  const babelConfigs: RollupBabelInputPluginOptions = {
    ...getBabelConfig(type, isTs, isNode),
    exclude: "node_modules/**",
    babelHelpers: "runtime",
    extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
  };

  const tsConfigPath = [
    path.resolve(cwd, 'tsconfig.json'),
    ...(isLerna? [path.resolve(cwd, '../../tsconfig.json')]: []),
    path.resolve(__dirname, '../../templates/tsconfig-components.json'),
   ].find(fs.existsSync) as string;

  const tsConfigData = tsConfigPath? require(tsConfigPath): {};

  tsConfigData.compilerOptions  = Object.assign(tsConfigData.compilerOptions||{}, {
    declaration: true,
    baseUrl: cwd,
    declarationDir: 'types'
  })

  tsConfigData.exclude = [...(tsConfigData.exclude || []), 'types'];

  const tsOptions = {
    cwd: cwd,
    typescript: ts,
    clean: true,
    cacheRoot: `${getCachePath()}/typescript2_cache`,
    tsconfigDefaults: tsConfigData,
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      compilerOptions: {
        target: 'esnext',
        module: 'esnext',
      },
    },
    exclude: [ "*.d.ts", "**/*.d.ts" ]
  }

  return [
      ...(!isNode? [
          url(),
          svgr(),
          postcss({
            extract: 'style/index.css',
            modules: false,
            autoModules: true,
            minimize: false,
            use: {
              less: {
                plugins: [
                  new LessPlugin({ prefix: '~' }),
                ],
                javascriptEnabled: true,
              },
              sass: null,
              stylus: false,
            },
            plugins:[
              autoprefixer({remove: false}),
            ]
          })
          ]: []
      ),
    nodeResolve({ extensions: babelExtensions, preferBuiltins: true }),
    commonjs(),
    ...(isTs? [
      typescript(tsOptions)
    ]: []),
    babel(babelConfigs),
    json(),
  ];
}

const filePathMap = {
  [BabelBuildType.UMD]: 'dist',
  [BabelBuildType.CJS]: 'lib',
  [BabelBuildType.ESM]: 'esm',
};

export const getRollupConfig = async (params: AllConfigs)=>{
  const { inputFilePath, type, cwd }= params;
  const config: RollupOptions = { input: inputFilePath}
  const pkg: Partial<PKG> = await import(path.resolve(cwd, 'package.json'));
  config.output = {
    format: type as InternalModuleFormat,
    file: path.resolve(cwd, `${filePathMap[type]}/index.js`),
    name: pkg.name || 'components',
    exports: type === BabelBuildType.CJS? 'auto' : 'default'
  }
  config.plugins = getPlugins(params);
  config.external = Object.keys(pkg.peerDependencies || {});
  return config;
};