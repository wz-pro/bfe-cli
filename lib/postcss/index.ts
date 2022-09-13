export const getPostCssConfig = () =>{
  return {
    minimize: true,
    plugins: [
      [
        'postcss-preset-env',
        {
          // 其他选项
        },
      ],
    ],
  }
}