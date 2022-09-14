export enum BabelBuildType {
  ESM='esm',
  CJS='cjs',
  UMD='umd'
}

export const getBabelConfig = (type: BabelBuildType, isTs= false, isNode = false)=>{
  return {
    presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets:
              !isNode? {
                browsers: [
                  "last 2 versions",
                  "IE 10"
                ]
              } : { node: 6 },
            modules: type === BabelBuildType.ESM? false : 'auto'
          }
        ],
        ...(isNode? []:[[require.resolve('@babel/preset-react'), { "runtime": "automatic" }]]),
        ...(isTs? [[require.resolve('@babel/preset-typescript')]]: []),
    ],
    plugins: [
        ...(!isNode? [require.resolve('babel-plugin-react-require')]: []),
      require.resolve("@babel/plugin-transform-runtime"),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      [require.resolve("@babel/plugin-proposal-decorators"), { "legacy": true }],
      require.resolve("@babel/plugin-proposal-class-properties"),
      require.resolve("@babel/plugin-proposal-object-rest-spread"),
      require.resolve("@babel/plugin-proposal-optional-chaining"),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      require.resolve("@babel/plugin-proposal-nullish-coalescing-operator"),
    ],
    babelrc: false,
  }
}