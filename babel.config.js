module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@src': './src',
          '@bubble': './src/bubble',
          '@parser': './src/parser',
          '@reminders': './src/reminders',
          '@notifications': './src/notifications',
          '@screens': './src/screens',
          '@components': './src/components',
          '@theme': './src/theme',
          '@store': './src/store',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
