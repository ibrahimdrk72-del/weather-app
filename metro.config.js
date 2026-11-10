// Metro: Expo'nun paketleyicisi (bundler). Tüm dosyaları tek pakette toplar.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind, Tailwind sınıflarını global.css dosyası üzerinden derler
module.exports = withNativeWind(config, { input: './global.css' });
