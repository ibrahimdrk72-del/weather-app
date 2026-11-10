# Hava Durumu

Expo SDK 58 ile geliştirilen Türkçe hava durumu uygulaması. Tahmin ve şehir arama verileri [Open-Meteo](https://open-meteo.com) üzerinden gelir. API anahtarı gerekmez.

- Konum alınamazsa İstanbul gösterilir. Ana ekrandan konumu tekrar deneyebilirsiniz.
- Gündüz ve gece kartları, 24 saatlik sıcaklık grafiği, ayrıntıları açılabilen 7 günlük tahmin ve hava koşullarına göre öneriler bulunur.
- Sistem, açık veya koyu tema ile °C/°F seçimi cihazda saklanır. Animasyonlar sistemin hareketi azaltma tercihini izler.
- Favoriler Android ve iOS’ta SQLite, web’de localStorage ile saklanır. Ağ isteği başarısız olduğunda, son 24 saat içinde alınmış bir tahmin varsa kayıt zamanı ve eski veri uyarısı gösterilir.
- Mobilde sistem paylaşım menüsü, web’de tarayıcının Web Share desteği kullanılır.

## Mac’te kurulum

Node.js 22.13 veya üzeri ve Git gerekir. Mevcut çalışma kopyanızdan ayrı bir klasöre klonlayın.

```bash
node -v
git clone --branch codex/weather-experience https://github.com/ibrahimdrk72-del/weather-app.git weather-app-experience
cd weather-app-experience
npm ci
npm run start:clear
```

iPhone’da Expo SDK 58 destekleyen Expo Go’yu açın. Mac ve iPhone aynı Wi-Fi ağındayken terminaldeki QR kodu iPhone kamerasıyla tarayın. Farklı ağlarda `npm run start:clear -- --tunnel` kullanabilirsiniz.

Tarayıcıda çalıştırmak için `npm run web` komutunu kullanın. Web’de konum izni için localhost veya HTTPS gerekir.

## Kontroller

```bash
npm test
npx tsc --noEmit
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

Android ve iOS çıktıları Expo Go üzerinde cihaz doğrulamasından ayrıca geçirilebilir.
