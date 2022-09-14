import { DEFAULT_EXTENSIONS } from '@babel/core';
import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import fs from 'fs';
import path from 'path';
import { InternalModuleFormat, Plugin, RollupOptions } from 'rollup';
import postcss from 'rollup-plugin-postcss';
import typescript  from 'rollup-plugin-typescript2';
import ts from 'typescript';

import { getCachePath } from '../../utils';
import { BabelBuildType, getBabelConfig } from '../babel';
import { getPostCssConfig } from '../postcss';

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

const babelExtensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx'];

const getPlugins = (type: BabelBuildType, isTs = false, isNode = false): Plugin[]=>{
  const babelConfigs: RollupBabelInputPluginOptions = {
    ...getBabelConfig(BabelBuildType.CJS, isTs, isNode),
    exclude: "**/node_modules/**",
    babelHelpers: "runtime",
    extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
  };

  const tsConfigPath = [
     path.resolve(process.cwd(), 'tsconfig.json'),
     path.resolve(__dirname, '../../templates/tsconfig-components.json'),
   ].find(fs.existsSync)

  const tsConfigData = tsConfigPath? require(tsConfigPath): {};
  tsConfigData.compilerOptions  = Object.assign(tsConfigData.compilerOptions||{}, {
    declaration: true,
    baseUrl: process.cwd(),
    declarationDir: 'types',
})


  return [

      ...(!isNode? [
          url(),
          svgr(),
          postcss({
          ...getPostCssConfig() })]:
          []
      ),
    nodeResolve({ extensions: babelExtensions }),
    commonjs(),
    ...(isTs? [
      typescript({
        cwd: process.cwd(),
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
      })
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

export const getRollupConfig = async (params: rollupConfigParams)=>{
  const { inputFilePath, type, isNode }= params;
  const cwd = process.cwd();
  const config: RollupOptions = { input: inputFilePath}
  const pkg: Partial<PKG> = await import(path.resolve(process.cwd(), 'package.json'));
  config.output = {
    format: type as InternalModuleFormat,
    file: path.resolve(cwd, `${filePathMap[type]}/index.js`),
    name: pkg.name || 'components',
    exports: type === BabelBuildType.CJS? 'auto' : 'default'
  }
  config.plugins = getPlugins(type, /\.(ts|tsx)$/.test(config.input as string), isNode);
  config.external = Object.keys(pkg.peerDependencies || {});
  return config;
};