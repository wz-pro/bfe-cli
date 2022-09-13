import HtmlWebpackPlugin from 'html-webpack-plugin';
import lodash from 'lodash';
import path from 'path';
import webpack, { Configuration } from 'webpack';

import { getCommonConfig, getFavicon, getIndexHtml } from './common';

const PUBLIC_PATH = '/';

export const getDevConfig = async (userConfig: Configuration): Promise<Configuration>=>{
  const baseConfig = await getCommonConfig(userConfig, 'dev');
  const devServer = lodash.merge({
    static: path.join(process.cwd(), 'dist'),
    host: '0.0.0.0',
    port: 8080,
    hot: false,
    client: false,
    historyApiFallback: {
      index: `${PUBLIC_PATH}index.html`,
    },
    allowedHosts: "all",
    compress: true,
    proxy: {},
  }, userConfig.devServer||{})

  return {
      ...baseConfig,
      entry: [
        'webpack/hot/dev-server.js',
        'webpack-dev-server/client/index.js?hot=true&live-reload=true',
        ((userConfig.entry || baseConfig?.entry) as webpack.EntryObject).main as string
      ],
      mode: 'development',
      optimization: {
        usedExports: true,
      },
      devtool: 'eval-source-map',
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          filename: 'index.html',
          favicon: getFavicon(),
          template: getIndexHtml(),
          inject: true,
        }),
        ...baseConfig.plugins || [],
        ...userConfig.plugins || [],
      ],
      devServer,
  }
}