import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin  from 'terser-webpack-plugin';
import { Configuration } from 'webpack';

import { getCommonConfig, getFavicon, getIndexHtml } from './common';

export const getProdConfig = async (userConfig: Configuration): Promise<Configuration>=>{

  const baseConfig = await getCommonConfig(userConfig, 'prod');

  return{
    ...baseConfig,
    entry: userConfig.entry || baseConfig.entry,
    mode: 'production',
    output: {
      ...baseConfig.output,
      filename: '[name].[chunkhash:8].js',
      chunkFilename: '[name].[chunkhash:8].chunk.js',
    },
    stats: {
      children: false, // 不输出子模块的打包信息
    },
    optimization: {
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin({
          parallel: true,
        })
      ],
      splitChunks: {
        chunks: 'all',
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[chunkhash:8].css',
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        favicon: getFavicon(),
        template: getIndexHtml(),
        hash: false,
        inject: 'body',
      }),
      ...(baseConfig.plugins || []),
      ...(userConfig.plugins || [])
    ],
  }
}