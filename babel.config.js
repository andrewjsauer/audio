module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@components': './src/components',
          '@lib': './src/lib',
          '@services': './src/services',
          '@locales': './src/locales',
          '@store': './src/store',
          '@styles': './src/styles',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};
