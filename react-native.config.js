/**
 * react-native.config.js
 * Declares font asset directories for react-native-asset to auto-copy
 * to android/app/src/main/assets/fonts/ and ios/<AppName>/Fonts/.
 *
 * Run: npx react-native-asset  (after adding/removing fonts)
 */
module.exports = {
  project: {
    android: {},
    ios: {},
  },
  assets: ['./assets/fonts/'],
};
