# Hava Durumu

Mobil Programlama dersi vize projesi. Expo (React Native) ile yazılmış bir hava durumu uygulaması.

Kullanıcı bulunduğu konumun veya aradığı şehrin hava durumunu görür, sevdiği şehirleri favorilere kaydeder.

## Özellikler

- Konuma göre hava durumu (izin verilmezse İstanbul gösterilir)
- Anlık hava: sıcaklık, hissedilen sıcaklık, açıklama ve ikon, günün en yüksek / en düşük sıcaklığı
- Ayrıntılar: nem, rüzgar hızı, gün doğumu ve gün batımı
- Önümüzdeki 24 saatin saatlik tahmini ve yağış olasılığı (yatay kaydırılabilir)
- 7 günlük tahmin: yağış olasılığı ve sıcaklık aralığı çubuğu
- Gündüz açık mavi, gece koyu lacivert kart
- Yazdıkça öneri getiren şehir arama
- Favori şehirler (telefonda SQLite veritabanında saklanır)
- Aşağı çekerek yenileme

## Kullanılan teknolojiler

| Teknoloji | Görevi |
| --- | --- |
| Expo SDK 54 + TypeScript | Uygulama altyapısı |
| Expo Router | Dosya tabanlı ekran geçişleri (navigation) |
| NativeWind 4.2.7 + Tailwind CSS v3 | Stil (className ile) |
| expo-location | Kullanıcının konumu |
| expo-sqlite | Favori şehirlerin saklanması |
| @expo/vector-icons | Hava durumu ikonları |
| Open-Meteo API | Hava durumu ve şehir arama verisi (ücretsiz, API anahtarı gerekmez) |

> **Neden Expo SDK 54?** App Store'daki Expo Go uygulaması en son SDK 54'ü destekliyor
> (SDK 55 ve sonrası App Store sürümünde yok). Uygulamanın iPhone'da Expo Go ile
> açılabilmesi için proje bilerek SDK 54'te tutuldu. **SDK sürümünü yükseltmeyin.**

## Gereksinimler (macOS)

- [Node.js](https://nodejs.org) 20 veya üzeri (LTS sürümü önerilir)
- Git
- iPhone'da App Store'dan indirilen **Expo Go** uygulaması

Node.js kurulu mu diye kontrol etmek için:

```bash
node -v
```

## Kurulum

Projeyi indir (çalışma `claude/hava-durumu-uygulamasi` dalındadır):

```bash
git clone -b claude/hava-durumu-uygulamasi https://github.com/ibrahimdrk72-del/weather-app.git
```

Proje klasörüne gir:

```bash
cd weather-app
```

Paketleri kur:

```bash
npm install
```

## Çalıştırma

```bash
npx expo start
```

Terminalde bir QR kod görünür.

### iPhone'da Expo Go ile açma

1. iPhone'a App Store'dan **Expo Go** uygulamasını kur.
2. iPhone ve Mac **aynı Wi-Fi ağına** bağlı olsun.
3. iPhone'un **Kamera** uygulamasını aç ve terminaldeki QR kodu okut.
4. Çıkan "Expo Go'da aç" bildirimine dokun.
5. Uygulama açılınca konum izni sorulur; "İzin Ver" dersen bulunduğun yerin, "İzin Verme" dersen İstanbul'un hava durumu gösterilir.

### Telefon ve bilgisayar farklı ağlardaysa

Okul ağı gibi cihazların birbirini görmediği ağlarda veya telefon mobil veriyle bağlıyken tünel modunu kullan:

```bash
npx expo start --tunnel
```

İlk çalıştırmada `@expo/ngrok` paketini kurmak isteyip istemediğini sorar; `y` yazıp onayla. Tünel modu biraz daha yavaştır ama telefon ile bilgisayarın aynı ağda olmasını gerektirmez.

### Sorun olursa

Önbelleği temizleyerek başlat:

```bash
npx expo start --clear
```

"Project is incompatible with this version of Expo Go" hatası alırsan: Expo Go'yu App Store'dan güncelle ve `package.json` içindeki `expo` sürümünün `~54` ile başladığını kontrol et.

## Kontrol komutları

TypeScript tip kontrolü:

```bash
npx tsc --noEmit
```

Expo proje sağlık kontrolü:

```bash
npx expo-doctor
```

## Klasör yapısı

```
app/          Ekranlar (Expo Router: her dosya bir ekran)
components/   Tekrar kullanılan arayüz bileşenleri
services/     API çağrıları (Open-Meteo)
db/           SQLite veritabanı işlemleri
hooks/        Özel hook'lar (konum, hava durumu, debounce)
types/        TypeScript tipleri
utils/        Yardımcı fonksiyonlar (hava durumu kodları, tarih, biçimlendirme)
```

Projenin ayrıntılı anlatımı, veri akışı ve olası sınav soruları için: [PROJE_ACIKLAMASI.md](./PROJE_ACIKLAMASI.md)

## Notlar

- Uygulama iPhone ve Android için tasarlandı. Web hedefi desteklenmiyor (SQLite ve konum izni telefonda çalışacak şekilde yazıldı).
- Veri kaynağı: [Open-Meteo](https://open-meteo.com) — ücretsiz, API anahtarı gerektirmez.
