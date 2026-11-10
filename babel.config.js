// Babel: yazdığımız modern JS/TS kodunu telefonun çalıştırabileceği koda çevirir.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: className özelliğini NativeWind'in işleyebilmesi için gerekli
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
