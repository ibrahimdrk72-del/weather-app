# Proje Açıklaması — Hava Durumu Uygulaması

Bu belge projeyi baştan sona, basit bir dille anlatır. Sınavdan önce bir kez okuyup, kodu yanında açarak takip etmen yeterli.

## İçindekiler

1. [Uygulamanın genel mantığı](#1-uygulamanın-genel-mantığı)
2. [Kullanılan teknolojiler ve neden seçildikleri](#2-kullanılan-teknolojiler-ve-neden-seçildikleri)
3. [Expo Go nedir, neden development build gerekmedi?](#3-expo-go-nedir-neden-development-build-gerekmedi)
4. [Klasör ve dosya yapısı](#4-klasör-ve-dosya-yapısı)
5. [Veritabanı tablosu](#5-veritabanı-tablosu)
6. [API: istekler ve gelen JSON](#6-api-istekler-ve-gelen-json)
7. [Veri akışı: açılıştan sıcaklığın görünmesine kadar](#7-veri-akışı-açılıştan-sıcaklığın-görünmesine-kadar)
8. [Konum izni](#8-konum-izni)
9. [NativeWind className'i nasıl stile çeviriyor?](#9-nativewind-classnamei-nasıl-stile-çeviriyor)
10. [Expo Router ekranları nasıl yönetiyor?](#10-expo-router-ekranları-nasıl-yönetiyor)
11. [Terimler sözlüğü](#11-terimler-sözlüğü)
12. [Hocanın sorabileceği sorular ve cevapları](#12-hocanın-sorabileceği-sorular-ve-cevapları)
13. [Sınavda canlı yapılabilecek 5 küçük değişiklik](#13-sınavda-canlı-yapılabilecek-5-küçük-değişiklik)

---

## 1. Uygulamanın genel mantığı

### Basit anlatım

Uygulama üç iş yapar:

1. **Hava durumunu gösterir.** Açılınca "konumunu kullanabilir miyim?" diye sorar. İzin verirsen bulunduğun yerin, vermezsen İstanbul'un hava durumunu gösterir: şu anki sıcaklık, önümüzdeki 24 saat ve 7 gün.
2. **Şehir aratır.** Büyüteç simgesine dokunursun, şehir adı yazarsın, yazdıkça öneriler gelir. Bir şehre dokununca o şehrin hava durumu açılır.
3. **Favorileri saklar.** Şehir ekranındaki kalbe dokununca şehir favorilere eklenir. Favoriler telefonun içinde saklanır; uygulamayı kapatıp açsan da kaybolmaz.

Uygulamanın kendi sunucusu yoktur. Hava durumu verisini internetteki ücretsiz **Open-Meteo** servisinden alır, favorileri de telefondaki küçük bir veritabanına (**SQLite**) yazar.

### Teknik anlatım

Kod **katmanlara** ayrılmıştır. Her katmanın tek bir görevi vardır:

```
Ekran (app/)  →  Hook (hooks/)  →  Servis (services/)  →  Open-Meteo API
                                →  Veritabanı (db/)    →  SQLite (telefon)
Ekran (app/)  →  Bileşen (components/)  →  Yardımcı (utils/)
```

- **Ekranlar** (`app/`) sadece "ne gösterilecek" kararını verir. İçlerinde `fetch` veya SQL yoktur.
- **Hook'lar** (`hooks/`) veriyi getirir ve durumunu tutar: yükleniyor mu, hata var mı, veri geldi mi.
- **Servisler** (`services/`) internete istek atar ve gelen JSON'u sade tiplere çevirir.
- **Veritabanı dosyaları** (`db/`) SQL sorgularını çalıştırır.
- **Bileşenler** (`components/`) tekrar kullanılan arayüz parçalarıdır (kart, liste, hata kutusu...).
- **Yardımcılar** (`utils/`) küçük saf fonksiyonlardır (hava durumu kodu → Türkçe açıklama gibi).

Bu ayrımın faydası: bir şeyi değiştirmek istediğinde nereye bakacağını bilirsin. API adresi değişirse sadece `services/`, tablo değişirse sadece `db/`, görünüm değişirse sadece `components/` değişir.

Her ekran **üç durumu** ele alır:

| Durum | Ne gösterilir | Bileşen |
| --- | --- | --- |
| Yükleniyor | Dönen gösterge + mesaj | `LoadingView` |
| Hata | Türkçe mesaj + "Tekrar dene" butonu | `ErrorView` |
| Boş | İkon + bilgi mesajı (örn. favori yok) | `EmptyView` |

---

## 2. Kullanılan teknolojiler ve neden seçildikleri

| Teknoloji | Ne işe yarıyor | Neden seçildi |
| --- | --- | --- |
| **React Native** | JavaScript/TypeScript ile gerçek iOS ve Android arayüzü oluşturur | Tek kodla iki platform |
| **Expo (SDK 54)** | React Native'in üzerine hazır araçlar ve modüller ekler | Xcode/Android Studio kurmadan, QR kodla telefonda çalıştırma |
| **TypeScript** | JavaScript'e tip ekler | Hataları daha kod yazarken yakalar (örn. yanlış alan adı) |
| **Expo Router** | Dosya adına göre ekran ve geçiş oluşturur | Ayrı bir navigation ayarı yazmaya gerek kalmaz; `app/` klasörüne bakınca ekranlar görünür |
| **NativeWind 4.2.7 + Tailwind CSS v3** | `className="p-4 bg-white"` gibi sınıflarla stil | Stil kodu kısa ve okunaklı; ayrı `StyleSheet` nesneleri yazmaya gerek yok |
| **expo-location** | Konum izni ister, koordinatı ve yer adını verir | Expo Go içinde hazır gelir |
| **expo-sqlite** | Telefonda SQLite veritabanı | Favoriler kalıcı olmalı; Expo Go içinde hazır gelir |
| **@expo/vector-icons** | Hazır ikon setleri (biz `MaterialCommunityIcons` kullanıyoruz) | İçinde `weather-sunny`, `weather-rainy` gibi hava durumu ikonları var |
| **Open-Meteo** | Hava durumu ve şehir arama API'si | Ücretsiz, API anahtarı gerektirmez |
| **fetch** | HTTP isteği atar | React Native'de yerleşik; axios gibi ek paket gerekmez |

Yardımcı paketler (doğrudan kullanmıyoruz, yukarıdakilerin çalışması için gerekli):

- `react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants`: Expo Router'ın ihtiyaç duyduğu paketler. `react-native-safe-area-context` içinden `SafeAreaView`'ü biz de kullanıyoruz.
- `react-native-reanimated`, `react-native-worklets`: NativeWind'in ihtiyaç duyduğu animasyon altyapısı.
- `expo-font`: İkon fontlarının yüklenmesi için (`@expo/vector-icons` kullanır).
- `react-dom`, `react-native-web`: Expo Router'ın isteğe bağlı bağımlılıkları. `npm install` sürüm çakışması vermesin diye Expo'nun önerdiği sürümlerle eklendi. Telefonda kullanılmazlar, saf JavaScript'tirler.
- `babel-preset-expo`, `tailwindcss`, `typescript`: Sadece geliştirme sırasında kullanılan araçlar (telefona gitmez).

**Sürüm notu:** NativeWind 4.2.7 yalnızca Tailwind CSS **v3** ile çalışır. Bu yüzden Tailwind v4 kullanılmadı.

---

## 3. Expo Go nedir, neden development build gerekmedi?

Bir React Native uygulamasının iki parçası vardır:

- **JavaScript kısmı:** Bizim yazdığımız kod (ekranlar, hook'lar...).
- **Native kısım:** Telefonun kamerasına, konumuna, veritabanına erişen Swift/Kotlin kodu.

**Expo Go**, App Store'dan indirilen hazır bir uygulamadır. İçinde Expo SDK'nın native kısımları (konum, SQLite, ikonlar, navigation...) **önceden derlenmiş** olarak bulunur. Biz `npx expo start` yazınca bilgisayarda bir sunucu (Metro) açılır; QR kodu okutunca Expo Go bizim JavaScript kodumuzu bu sunucudan indirir ve kendi içindeki native kısımlarla çalıştırır.

**Development build** ise kendi native kodunu derleyip kendi uygulamanı oluşturmaktır. Sadece Expo Go'nun içinde **bulunmayan** bir native modül kullanırsan gerekir (örn. özel bir Bluetooth kütüphanesi). Bunun için Xcode, Apple geliştirici hesabı vb. gerekir.

Bu projede development build gerekmedi, çünkü:

- Kullandığımız tüm native modüller (`expo-location`, `expo-sqlite`, `expo-router`'ın ihtiyaçları, `react-native-reanimated`...) Expo Go'nun içinde hazır.
- Geri kalan paketler (NativeWind gibi) saf JavaScript; native derleme istemiyor.
- `expo-dev-client` paketi bilerek kurulmadı.

**Neden SDK 54?** Her Expo Go sürümü tek bir SDK sürümünü destekler ve proje ile aynı olmalıdır. App Store'daki Expo Go, SDK 54'ü destekler; daha yeni SDK'lar (55+) App Store sürümünde yoktur. Bu yüzden proje SDK 54'te tutuldu.

---

## 4. Klasör ve dosya yapısı

```
weather-app/
├── app/                        EKRANLAR (Expo Router)
│   ├── _layout.tsx             Kök layout: Stack navigasyonu, global.css burada yüklenir
│   ├── (tabs)/
│   │   ├── _layout.tsx         Alt tab bar (Hava Durumu, Favoriler)
│   │   ├── index.tsx           Ana ekran: konumun hava durumu
│   │   └── favorites.tsx       Favoriler ekranı
│   ├── search.tsx              Şehir arama ekranı (modal)
│   └── city/
│       └── [id].tsx            Şehir detay ekranı (dinamik route)
│
├── components/                 TEKRAR KULLANILAN BİLEŞENLER
│   ├── WeatherView.tsx         Hava durumu içeriğinin tamamı (ana ekran + detay ortak kullanır)
│   ├── CurrentWeatherCard.tsx  Anlık hava kartı (mavi kart)
│   ├── HourlyForecast.tsx      24 saatlik yatay liste
│   ├── DailyForecast.tsx       7 günlük liste
│   ├── LoadingView.tsx         Yükleniyor durumu
│   ├── ErrorView.tsx           Hata durumu + "Tekrar dene"
│   ├── EmptyView.tsx           Boş durum (ikon + mesaj)
│   └── InfoBanner.tsx          Sarı bilgi kutusu
│
├── services/                   API ÇAĞRILARI
│   ├── http.ts                 Zaman aşımlı ortak fetch + Türkçe hata mesajları
│   ├── geocoding.ts            Şehir arama (searchCities)
│   └── weather.ts              Hava durumu (getWeather, getCurrentSummaries)
│
├── db/                         VERİTABANI
│   ├── database.ts             Veritabanını açar, tabloyu oluşturur
│   └── favorites.ts            Favori ekle / sil / listele / kontrol et
│
├── hooks/                      ÖZEL HOOK'LAR
│   ├── useLocation.ts          Konum izni + konum (yoksa İstanbul)
│   ├── useWeather.ts           Hava durumu verisi + yükleniyor/hata/yenileme durumu
│   └── useDebounce.ts          Yazmayı bırakınca güncellenen değer
│
├── types/
│   └── weather.ts              Tüm TypeScript tipleri (City, WeatherData...)
│
├── utils/                      YARDIMCILAR
│   ├── weatherCodes.ts         WMO kodu → Türkçe açıklama + ikon
│   ├── date.ts                 Türkçe gün adı, tarih ve saat biçimlendirme
│   ├── format.ts               Sıcaklık biçimlendirme (17.6 → "18°")
│   ├── navigation.ts           Şehir detay ekranını açan ortak fonksiyon
│   └── confirm.ts              "Favorilerden çıkarılsın mı?" onay penceresi
│
├── assets/                     Uygulama ikonu ve açılış görseli
├── app.json                    Expo ayarları (uygulama adı, konum izni metni, plugin'ler)
├── package.json                Paket listesi ve komutlar
├── babel.config.js             Babel ayarı (NativeWind için)
├── metro.config.js             Metro ayarı (NativeWind için)
├── tailwind.config.js          Tailwind ayarı (hangi dosyalar taranacak)
├── global.css                  Tailwind'in giriş dosyası
├── nativewind-env.d.ts         TypeScript'e className'i tanıtır
└── tsconfig.json               TypeScript ayarı
```

### Dosyaları biraz daha yakından

**`app/_layout.tsx`** — Uygulamanın en dış kabuğu. Bir `Stack` tanımlar ve içine üç şey koyar: `(tabs)` (tab bar'lı bölüm), `search` (modal olarak açılır) ve `city/[id]` (detay). `global.css` burada bir kez import edilir.

**`app/(tabs)/index.tsx`** — `useLocation()` ile yeri bulur, sonra `<WeatherView>` bileşenine enlem/boylam verir. Konum izni yoksa `<InfoBanner>` ile bilgi mesajı gösterir. Sağ üstteki büyüteç `router.push('/search')` ile arama modalını açar.

**`app/city/[id].tsx`** — URL parametrelerinden şehri okur, aynı `<WeatherView>` bileşenini gösterir. Başlığın sağındaki kalp butonu `db/favorites.ts` fonksiyonlarını çağırır.

**`app/search.tsx`** — `TextInput` + `useDebounce` + `searchCities`. Dört durumu vardır: henüz yazılmadı, aranıyor, hata, sonuç yok / sonuç listesi.

**`app/(tabs)/favorites.tsx`** — Favorileri veritabanından okur, sonra hepsinin sıcaklığını **tek istekle** getirir. `useFocusEffect` sayesinde sekmeye her dönüldüğünde liste yenilenir.

**`components/WeatherView.tsx`** — Projenin "kod tekrarını önleyen" ana parçası. `useWeather` hook'unu çağırır, duruma göre `LoadingView`, `ErrorView` veya kartları gösterir. Aşağı çekerek yenileme (`RefreshControl`) de buradadır.

**`services/http.ts`** — `fetchJson(url)`: `AbortController` ile 10 saniyelik zaman aşımı uygular; internet yoksa, süre dolarsa veya sunucu hata kodu dönerse anlaşılır Türkçe bir `Error` fırlatır.

**`utils/weatherCodes.ts`** — Tek bir tablo (`WEATHER_CODES`): her WMO kodu için Türkçe açıklama, gündüz ikonu ve gece ikonu. İki fonksiyon dışarı açılır: `getWeatherDescription(kod)` ve `getWeatherIcon(kod, gündüzMü)`.

---

## 5. Veritabanı tablosu

Veritabanı dosyası: `weather.db` (telefonda, uygulamaya özel alanda). Tek tablo var: `favorites`.

```sql
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at INTEGER NOT NULL
);
```

| Sütun | Tip | Neden bu tip / neden var |
| --- | --- | --- |
| `id` | `INTEGER PRIMARY KEY` | Open-Meteo'nun şehre verdiği benzersiz numara (örn. İzmir = 311046). Tam sayı olduğu için `INTEGER`. **`PRIMARY KEY`** olduğu için aynı id ikinci kez eklenemez → aynı şehir iki kez favori olamaz. |
| `name` | `TEXT` | Şehir adı metindir. Listede göstermek için. |
| `country` | `TEXT` | Ülke adı. Aynı isimli şehirleri ayırt etmek için (bilinmiyorsa boş metin). |
| `latitude` | `REAL` | Enlem ondalıklı sayıdır (38.41). SQLite'ta ondalıklı sayı tipi `REAL`'dir. Hava durumunu sormak için gerekli. |
| `longitude` | `REAL` | Boylam, aynı sebeple `REAL`. |
| `created_at` | `INTEGER` | Eklenme zamanı (`Date.now()`, milisaniye cinsinden tam sayı). Listeyi eklenme sırasına göre sıralamak için. |

`NOT NULL`: Bu sütunlar boş bırakılamaz; eksik veriyle kayıt oluşmasını engeller.

`CREATE TABLE IF NOT EXISTS`: Tablo yoksa oluşturur, varsa dokunmaz. Uygulama her açıldığında güvenle çalıştırılabilir.

**Neden sıcaklık saklanmıyor?** Çünkü sıcaklık sürekli değişir. Veritabanında sadece değişmeyen bilgi (şehir kimliği ve koordinat) durur; sıcaklık her seferinde API'den taze alınır.

### Sorgular (`db/favorites.ts`)

| Fonksiyon | Sorgu |
| --- | --- |
| `getFavorites()` | `SELECT id, name, country, latitude, longitude FROM favorites ORDER BY created_at ASC` |
| `isFavorite(id)` | `SELECT id FROM favorites WHERE id = ?` |
| `addFavorite(city)` | `INSERT OR IGNORE INTO favorites (...) VALUES (?, ?, ?, ?, ?, ?)` |
| `removeFavorite(id)` | `DELETE FROM favorites WHERE id = ?` |

**Parametreli sorgu:** `?` işaretleri yer tutucudur. Değerler SQL metninin içine yazılmaz, ayrı bir dizi olarak verilir: `db.runAsync('DELETE FROM favorites WHERE id = ?', [id])`. Böylece şehir adında tırnak işareti olsa bile sorgu bozulmaz ve **SQL injection** mümkün olmaz.

**`INSERT OR IGNORE`:** Aynı `id` zaten varsa hata vermek yerine eklemeyi sessizce atlar. Yani "aynı şehir iki kez eklenemesin" kuralı iki katmanda korunur: `PRIMARY KEY` + `OR IGNORE`.

---

## 6. API: istekler ve gelen JSON

İki adres kullanılıyor. İkisi de `GET` isteğidir ve API anahtarı istemez.

### 6.1 Şehir arama (geocoding) — `services/geocoding.ts`

```
https://geocoding-api.open-meteo.com/v1/search?name=izmir&count=10&language=tr&format=json
```

| Parametre | Anlamı |
| --- | --- |
| `name` | Aranan metin (`encodeURIComponent` ile URL'e uygun hale getirilir) |
| `count=10` | En fazla 10 sonuç |
| `language=tr` | Şehir ve ülke adları Türkçe gelsin |
| `format=json` | Cevap JSON olsun |

Gelen cevap (kısaltılmış):

```json
{
  "results": [
    {
      "id": 311046,
      "name": "İzmir",
      "latitude": 38.41273,
      "longitude": 27.13838,
      "country": "Türkiye",
      "admin1": "İzmir"
    }
  ]
}
```

Nasıl kullanıyoruz: `results` dizisindeki her elemandan `id`, `name`, `country`, `admin1`, `latitude`, `longitude` alınıp `City` tipine çevrilir. **Sonuç yoksa `results` alanı hiç gelmez**; bu yüzden `data.results ?? []` yazarak boş diziye çeviriyoruz.

### 6.2 Hava durumu (forecast) — `services/weather.ts`

```
https://api.open-meteo.com/v1/forecast
  ?latitude=38.41&longitude=27.14
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day
  &hourly=temperature_2m,weather_code,is_day
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &forecast_days=7
  &timezone=auto
```

| Parametre | Anlamı |
| --- | --- |
| `latitude`, `longitude` | Hangi konum |
| `current=...` | Anlık değerler: sıcaklık, hissedilen, nem, rüzgar, hava kodu, gündüz mü |
| `hourly=...` | Saatlik değerler: sıcaklık, hava kodu, gündüz mü |
| `daily=...` | Günlük değerler: hava kodu, en yüksek, en düşük sıcaklık |
| `forecast_days=7` | 7 günlük veri |
| `timezone=auto` | Saatler o şehrin yerel saatiyle gelsin |

Birimler Open-Meteo'nun varsayılanıdır: sıcaklık **°C**, rüzgar **km/s** (km/h). Ek parametre gerekmez.

Gelen cevap (kısaltılmış):

```json
{
  "current": {
    "time": "2026-11-10T14:15",
    "temperature_2m": 17.6,
    "apparent_temperature": 16.2,
    "relative_humidity_2m": 64,
    "wind_speed_10m": 12.4,
    "weather_code": 2,
    "is_day": 1
  },
  "hourly": {
    "time": ["2026-11-10T00:00", "2026-11-10T01:00", "..."],
    "temperature_2m": [11.2, 10.9, "..."],
    "weather_code": [0, 1, "..."],
    "is_day": [0, 0, "..."]
  },
  "daily": {
    "time": ["2026-11-10", "2026-11-11", "..."],
    "weather_code": [2, 61, "..."],
    "temperature_2m_max": [18.1, 16.4, "..."],
    "temperature_2m_min": [11.0, 10.2, "..."]
  }
}
```

Nasıl kullanıyoruz (`getWeather` fonksiyonu):

- **`current`** → doğrudan `CurrentWeather` nesnesine çevrilir (`temperature_2m` → `temperature` gibi daha okunaklı adlar verilir, `is_day: 1` → `isDay: true` yapılır).
- **`hourly`** → Open-Meteo veriyi **paralel diziler** halinde gönderir: `time[3]`, `temperature_2m[3]` ve `weather_code[3]` aynı saate aittir. `map` ile bunları `{ time, temperature, weatherCode, isDay }` nesnelerine çeviriyoruz. Saatlik veri günün 00:00'ından başladığı için, `current.time`'ın saatine denk gelen kaydı buluyor (`findIndex`) ve oradan itibaren **24 tanesini** alıyoruz (`slice`).
- **`daily`** → Aynı şekilde `{ date, weatherCode, tempMax, tempMin }` nesnelerine çevrilir (7 eleman).
- **`weather_code`** → `utils/weatherCodes.ts` ile Türkçe açıklamaya ve ikona çevrilir (örn. `2` → "Parçalı bulutlu").

### 6.3 Favoriler için toplu istek (`getCurrentSummaries`)

Favoriler ekranında her şehir için ayrı istek atmak yerine **tek istek** atılır. Open-Meteo virgülle ayrılmış birden fazla koordinat kabul eder:

```
https://api.open-meteo.com/v1/forecast?latitude=38.41,39.92&longitude=27.14,32.85&current=temperature_2m,weather_code,is_day&timezone=auto
```

Birden fazla konum gönderilince cevap bir **dizi** olur (gönderdiğimiz sırayla); tek konum gönderilince tek bir **nesne** olur. Kod ikisini de diziye çevirir: `Array.isArray(data) ? data : [data]`.

---

## 7. Veri akışı: açılıştan sıcaklığın görünmesine kadar

1. **Uygulama açılır.** Expo Router `app/_layout.tsx`'i çalıştırır. `global.css` yüklenir, `Stack` oluşturulur. İlk ekran `(tabs)` grubunun `index.tsx` dosyasıdır.
2. **`HomeScreen` ilk kez çizilir.** `useLocation()` hook'u çağrılır. Başlangıçta `loading = true` olduğu için ekranda "Konumunuz alınıyor..." (`LoadingView`) görünür.
3. **`useLocation` içindeki `useEffect` çalışır** (ekran ilk çizildikten sonra, bir kez). `Location.requestForegroundPermissionsAsync()` çağrılır → telefonda izin penceresi çıkar.
4. **Kullanıcı cevap verir.**
   - *İzin verildi:* `getLastKnownPositionAsync()` (hızlı) denenir, sonuç yoksa `getCurrentPositionAsync()` ile konum alınır. Sonra `reverseGeocodeAsync()` ile koordinat yer adına çevrilir (örn. "Kadıköy").
   - *İzin verilmedi:* Yer olarak İstanbul seçilir ve bir bilgi mesajı hazırlanır.
5. **`setPlace(...)` ve `setLoading(false)` çağrılır.** State değiştiği için React `HomeScreen`'i yeniden çizer. Artık `place` dolu olduğundan `<WeatherView latitude=... longitude=...>` gösterilir.
6. **`WeatherView` içinde `useWeather(latitude, longitude)` çalışır.** `loading = true` → "Hava durumu yükleniyor..." görünür. `useEffect` içinden `load()` → `getWeather()` çağrılır.
7. **`getWeather`** (services/weather.ts) URL'i oluşturur ve `fetchJson(url)`'i çağırır.
8. **`fetchJson`** (services/http.ts) 10 saniyelik zamanlayıcıyı kurar, `fetch` ile isteği atar, cevabı JSON'a çevirir.
9. **`getWeather`** ham JSON'u `WeatherData` tipine dönüştürür (`current`, 24 saatlik `hourly`, 7 günlük `daily`) ve döndürür.
10. **`useWeather`** `setData(result)` ve `setLoading(false)` yapar → `WeatherView` yeniden çizilir.
11. **Ekranda sıcaklık görünür.** `WeatherView` üç bileşeni çizer: `CurrentWeatherCard` (sıcaklık, açıklama, nem, rüzgar), `HourlyForecast`, `DailyForecast`. Bu bileşenler `utils/` fonksiyonlarıyla kodu açıklamaya/ikona, tarihi Türkçe gün adına çevirir.

**Hata olursa** (8. adımda internet yoksa): `fetchJson` Türkçe mesajlı bir hata fırlatır → `useWeather` bunu yakalayıp `setError(mesaj)` yapar → `WeatherView`, `ErrorView`'ü gösterir → "Tekrar dene" butonu `load()`'u yeniden çağırır.

**Aşağı çekince:** `RefreshControl` → `refresh()` → aynı `getWeather` çağrısı; ama bu kez tam ekran yükleniyor göstergesi yerine sadece üstte küçük gösterge döner, eski veri ekranda kalır.

---

## 8. Konum izni

**Nasıl isteniyor?** `hooks/useLocation.ts` içinde:

```ts
const { status } = await Location.requestForegroundPermissionsAsync();
```

- "Foreground" = sadece uygulama açıkken konum. Arka planda konum takibi yapmıyoruz, o yüzden daha az yetki isteyen bu izin yeterli.
- Bu satır çalışınca işletim sistemi kendi izin penceresini gösterir. Pencereyi biz çizmiyoruz.
- iOS'ta bu pencerede gösterilen açıklama metni `app.json` içinde tanımlıdır (`NSLocationWhenInUseUsageDescription`): *"Bulunduğunuz yerin hava durumunu gösterebilmek için konumunuza ihtiyacımız var..."*. Not: Expo Go ile test ederken pencerede Expo Go'nun kendi metni görünür; bizim metnimiz uygulama mağazaya ayrı bir uygulama olarak derlendiğinde kullanılır.
- Kullanıcı daha önce cevap verdiyse sistem tekrar sormaz, kayıtlı cevabı döndürür.

**Reddedilirse ne oluyor?**

- `status` değeri `'granted'` olmaz.
- Yer olarak sabit tanımlı İstanbul (`DEFAULT_PLACE`) kullanılır.
- Ekranın üstünde sarı kutuda nazik bir mesaj çıkar: *"Konum izni verilmediği için İstanbul gösteriliyor. Dilerseniz telefonunuzun ayarlarından konum iznini açabilirsiniz."*
- Uygulama çökmez, hata ekranı göstermez; normal şekilde çalışmaya devam eder. Kullanıcı arama ile istediği şehre bakabilir.

**Konum alınamazsa** (izin var ama GPS kapalı vb.): `try/catch` hatayı yakalar, yine İstanbul gösterilir ve "Konumunuz alınamadığı için İstanbul gösteriliyor." mesajı çıkar.

---

## 9. NativeWind className'i nasıl stile çeviriyor?

React Native'de normalde stil şöyle yazılır:

```tsx
<View style={{ padding: 16, backgroundColor: 'white', borderRadius: 16 }} />
```

NativeWind ile aynı şey:

```tsx
<View className="p-4 bg-white rounded-2xl" />
```

React Native `className`'i tanımaz; aradaki çeviriyi NativeWind yapar. Adımlar:

1. **Tarama (derleme zamanı):** `tailwind.config.js` içindeki `content` listesi Tailwind'e hangi dosyalara bakacağını söyler (`app/` ve `components/`). Tailwind bu dosyalarda geçen sınıf adlarını (`p-4`, `bg-white`...) bulur.
2. **CSS üretimi:** `global.css` içindeki `@tailwind` satırları, bulunan sınıfların CSS karşılıklarıyla doldurulur (`p-4` → `padding: 16px`).
3. **React Native stiline çeviri:** `metro.config.js` içindeki `withNativeWind(...)`, Metro paketleyicisine bu CSS'i React Native'in anlayacağı stil nesnelerine çevirmesini söyler (`padding: 16px` → `{ padding: 16 }`).
4. **className'in bağlanması:** `babel.config.js` içindeki `jsxImportSource: 'nativewind'` ayarı sayesinde JSX derlenirken her bileşen NativeWind'in sarmalayıcısından geçer. Bu sarmalayıcı çalışma zamanında `className`'deki sınıfları 3. adımda üretilen stillerle eşleştirip bileşene `style` olarak verir.

Kısaca: **className → (Tailwind) CSS → (NativeWind/Metro) stil nesnesi → (Babel/JSX) bileşenin `style` özelliği.**

İlgili dosyalar: `tailwind.config.js`, `global.css`, `metro.config.js`, `babel.config.js`, `nativewind-env.d.ts` (TypeScript `className`'e hata vermesin diye) ve `app/_layout.tsx` içindeki `import '../global.css'`.

Sık kullandığımız sınıflar:

| Sınıf | Anlamı |
| --- | --- |
| `flex-1` | Boş alanın tamamını kapla |
| `flex-row` | Çocukları yan yana diz |
| `items-center` / `justify-center` | Hizalama (çapraz eksen / ana eksen) |
| `p-4`, `px-4`, `py-3`, `mt-4`, `mb-3` | İç boşluk (padding) ve dış boşluk (margin). 4 = 16 piksel |
| `rounded-2xl`, `rounded-full` | Köşe yuvarlama |
| `bg-sky-500`, `text-white`, `text-slate-800` | Arka plan ve yazı rengi |
| `text-base`, `text-2xl`, `text-7xl` | Yazı boyutu |
| `font-bold`, `font-semibold` | Yazı kalınlığı |
| `active:opacity-70` | Basılıyken yarı saydam yap |

Not: Sayı gerektiren birkaç yerde (ikon `size`/`color`, `contentContainerStyle`) normal prop kullanıldı; çünkü bunlar `className` almayan özelliklerdir.

---

## 10. Expo Router ekranları nasıl yönetiyor?

**Temel kural:** `app/` klasöründeki her dosya bir ekrandır ve dosya yolu ekranın adresidir.

| Dosya | Adres | Ekran |
| --- | --- | --- |
| `app/(tabs)/index.tsx` | `/` | Ana ekran |
| `app/(tabs)/favorites.tsx` | `/favorites` | Favoriler |
| `app/search.tsx` | `/search` | Arama (modal) |
| `app/city/[id].tsx` | `/city/311046` | Şehir detayı |

**Özel adlar:**

- **`_layout.tsx`** — Ekran değildir; bulunduğu klasördeki ekranların **nasıl düzenleneceğini** söyler. `app/_layout.tsx` bir `Stack` (ekranlar üst üste açılır, geri tuşuyla dönülür), `app/(tabs)/_layout.tsx` bir `Tabs` (alt tab bar) tanımlar.
- **`(tabs)`** — Parantezli klasör bir **gruptur**. Dosyaları düzenler ama adrese eklenmez. Bu yüzden `(tabs)/index.tsx`'in adresi `/(tabs)` değil, `/`'dir.
- **`index.tsx`** — Klasörün varsayılan ekranı.
- **`[id].tsx`** — Köşeli parantez **dinamik route** demektir: `id` yerine herhangi bir değer gelebilir.

**İç içe yapı:** Kök `Stack`'in ilk ekranı `(tabs)` grubudur. Yani tab bar'lı bölüm, stack'in tek bir "sayfası" gibidir. Arama ve şehir detayı bu sayfanın **üzerine** açılır; bu yüzden onlar açıkken tab bar görünmez ve geri tuşuyla tab'lara dönülür.

**Modal:** `app/_layout.tsx` içinde `search` ekranına `presentation: 'modal'` verilmiştir. Bu sayede arama ekranı iOS'ta alttan yukarı kayan bir pencere olarak açılır.

**Ekranlar arası geçiş:**

```ts
router.push('/search');   // Arama ekranını aç
router.back();            // Bir önceki ekrana dön
```

**Dinamik route ve parametreler:** Şehir detayını açarken (`utils/navigation.ts`):

```ts
router.push({
  pathname: '/city/[id]',
  params: { id: 311046, name: 'İzmir', country: 'Türkiye', latitude: 38.41, longitude: 27.14 },
});
```

Bu, `/city/311046?name=İzmir&country=Türkiye&latitude=38.41&longitude=27.14` adresine karşılık gelir. `id` yolun parçası olur, diğerleri sorgu parametresi olarak eklenir.

Detay ekranı parametreleri şöyle okur (`app/city/[id].tsx`):

```ts
const params = useLocalSearchParams<Params>();
const latitude = Number(params.latitude); // parametreler hep metin gelir, sayıya çeviriyoruz
```

**Neden enlem/boylam ve ad parametre olarak gönderiliyor?** Detay ekranı sadece `id` alsaydı, şehrin koordinatını bulmak için bir istek daha atması gerekirdi. Arama sonucunda bu bilgiler zaten elimizde olduğu için doğrudan gönderiyoruz; detay ekranı hemen hava durumunu isteyebiliyor.

**Başlığı ekranın içinden ayarlama:** Detay ekranı `<Stack.Screen options={{ title: city.name, headerRight: ... }} />` yazarak üst başlığa şehir adını ve kalp butonunu koyar.

---

## 11. Terimler sözlüğü

| İngilizce | Türkçe | Kısa açıklama |
| --- | --- | --- |
| Component | Bileşen | Ekranın tekrar kullanılabilir bir parçası (fonksiyon olarak yazılır) |
| Props | Özellikler | Bileşene dışarıdan verilen değerler |
| State | Durum | Bileşenin hatırladığı, değişince ekranı yeniden çizdiren veri |
| Hook | Kanca | `use` ile başlayan, bileşene state/etki gibi yetenekler ekleyen fonksiyon |
| Custom hook | Özel hook | Kendi yazdığımız hook (`useWeather` gibi) |
| Render | Çizim / render | Bileşenin ekrana dönüştürülmesi |
| Side effect | Yan etki | Çizim dışındaki işler (istek atmak, izin istemek) — `useEffect` içinde yapılır |
| Navigation | Gezinme | Ekranlar arası geçiş |
| Route | Rota / yol | Bir ekranın adresi |
| Dynamic route | Dinamik rota | Adresinde değişken parça olan ekran (`[id]`) |
| Layout | Yerleşim / düzen | Ekranları saran yapı (Stack, Tabs) |
| Stack | Yığın | Ekranların üst üste açıldığı gezinme türü |
| Tab bar | Sekme çubuğu | Alttaki sekmeler |
| Modal | Modal / açılır pencere | Mevcut ekranın üzerine açılan ekran |
| API | Uygulama programlama arayüzü | Başka bir servisten veri almanın yolu |
| Endpoint | Uç nokta | API'nin belirli bir adresi |
| Request / Response | İstek / Cevap | Sunucuya gönderilen ve gelen mesaj |
| Fetch | Getirmek | HTTP isteği atan yerleşik fonksiyon |
| Timeout | Zaman aşımı | İstek belli sürede bitmezse iptal etme |
| Debounce | Geciktirme / sektirmeme | Art arda gelen olaylardan sadece sonuncusundan sonra işlem yapma |
| Geocoding | Coğrafi kodlama | Yer adını koordinata çevirme |
| Reverse geocoding | Ters coğrafi kodlama | Koordinatı yer adına çevirme |
| Latitude / Longitude | Enlem / Boylam | Konumun koordinatları |
| Permission | İzin | Kullanıcının verdiği yetki (konum gibi) |
| Database | Veritabanı | Verilerin kalıcı saklandığı yer |
| Query | Sorgu | Veritabanına gönderilen komut |
| Parameterized query | Parametreli sorgu | Değerlerin `?` ile ayrı gönderildiği güvenli sorgu |
| Primary key | Birincil anahtar | Her satırı benzersiz tanımlayan sütun |
| SQL injection | SQL enjeksiyonu | Kullanıcı girdisiyle sorgunun değiştirilmesi saldırısı |
| Async / Await | Eşzamansız / bekle | Uzun süren işleri ekranı dondurmadan bekleme yöntemi |
| Promise | Söz | İleride sonuçlanacak işlemi temsil eden nesne |
| Pull-to-refresh | Çekerek yenileme | Listeyi aşağı çekip veriyi yenileme |
| Safe area | Güvenli alan | Çentik ve alt çizginin kapatmadığı ekran bölgesi |
| Bundler | Paketleyici | Tüm kod dosyalarını tek pakette toplayan araç (Metro) |
| Development build | Geliştirme derlemesi | Kendi native kodunla derlenen özel uygulama |
| Loading / Error / Empty state | Yükleniyor / Hata / Boş durum | Bir ekranın veri yokken alabileceği haller |
| Type | Tip | Bir verinin şekli (TypeScript) |
| Utility / Helper | Yardımcı | Küçük, genel amaçlı fonksiyon |

---

## 12. Hocanın sorabileceği sorular ve cevapları

### Genel

**1. Bu uygulama ne yapıyor?**
Konumun veya aranan şehrin anlık, saatlik (24 saat) ve 7 günlük hava durumunu gösterir; şehirleri favorilere kaydeder. Veriyi Open-Meteo API'sinden alır, favorileri telefonda SQLite'ta saklar.

**2. Neden Expo kullandın, düz React Native değil?**
Expo ile Xcode/Android Studio kurmadan, QR kod okutarak telefonda Expo Go üzerinden çalıştırabiliyorum. Konum, SQLite gibi modüller hazır geliyor.

**3. Expo Go nedir? Neden development build gerekmedi?**
Expo Go, Expo SDK'nın native modüllerini içinde hazır bulunduran bir uygulamadır; benim JavaScript kodumu indirip çalıştırır. Kullandığım tüm native modüller (expo-location, expo-sqlite...) Expo Go'da hazır olduğu ve diğer paketler saf JavaScript olduğu için kendi native derlememe gerek kalmadı.

**4. Neden Expo SDK 54, daha yenisi değil?**
App Store'daki Expo Go en son SDK 54'ü destekliyor. Proje ile Expo Go'nun SDK sürümü aynı olmak zorunda; daha yeni SDK kullansaydım iPhone'da Expo Go ile açılmazdı.

**5. Klasör yapısını neden böyle kurdun?**
Her klasörün tek görevi var: `app` ekranlar, `components` tekrar kullanılan parçalar, `services` API, `db` veritabanı, `hooks` veri/durum mantığı, `types` tipler, `utils` yardımcılar. Böylece bir değişiklik için nereye bakacağım belli ve ekran dosyaları sade kalıyor.

### React ve hook'lar

**6. `useState` ne işe yarıyor? Örnek ver.**
Bileşenin hatırladığı veriyi tutar; değeri değişince ekran yeniden çizilir. Örnek: `useWeather` içinde `const [loading, setLoading] = useState(true)`. `setLoading(false)` çağrılınca yükleniyor göstergesi kaybolur.

**7. `useEffect` burada neden kullanıldı?**
İstek atmak ve izin istemek "yan etki"dir; çizim sırasında değil, çizimden sonra yapılmalıdır. `useLocation`'da `useEffect(..., [])` ekran ilk açıldığında bir kez konum iznini ister. `useWeather`'da `useEffect` ekran açıldığında (ve koordinat değişirse) hava durumunu getirir.

**8. `useEffect`'in sonundaki köşeli parantez (bağımlılık dizisi) ne anlama geliyor?**
Etkinin ne zaman tekrar çalışacağını belirler. `[]` → sadece ilk çizimde bir kez. `[debouncedQuery]` → `debouncedQuery` her değiştiğinde. Dizi hiç yazılmazsa her çizimde çalışır.

**9. Özel hook (custom hook) nedir, neden yazdın?**
`use` ile başlayan ve içinde başka hook'lar kullanan kendi fonksiyonumuz. `useWeather` yükleniyor/hata/veri/yenileme mantığını tek yerde toplar. Bu sayede ana ekran ve detay ekranı aynı mantığı tekrar yazmadan kullanır.

**10. `useCallback` neden kullanıldı?**
Fonksiyonun her çizimde yeniden oluşturulmasını engeller. `useWeather`'da `load` fonksiyonu `useEffect`'in bağımlılığıdır; `useCallback` olmasaydı her çizimde yeni bir fonksiyon oluşur, `useEffect` sürekli tekrar çalışır ve sonsuz istek döngüsü oluşurdu.

**11. `useFocusEffect` ile `useEffect` arasındaki fark ne? Neden favorilerde `useFocusEffect` var?**
`useEffect` bileşen ilk oluşturulduğunda çalışır. Tab ekranları bir kez oluşturulup bellekte kalır; bu yüzden `useEffect` favoriler sekmesine her dönüşte çalışmaz. `useFocusEffect` ise ekran her **görünür olduğunda** çalışır. Detay ekranında favori ekleyip geri dönünce listenin güncellenmesi için bu gerekli.

**12. Ana ekran ve detay ekranı arasında kod tekrarını nasıl önledin?**
İkisi de `components/WeatherView.tsx` bileşenini kullanır. Bu bileşen enlem/boylam alır, `useWeather` ile veriyi getirir ve kartları çizer. Ekranlar sadece hangi koordinatı vereceklerine karar verir.

### API ve ağ

**13. Hava durumu verisi nereden geliyor? API anahtarı var mı?**
Open-Meteo'dan (`api.open-meteo.com/v1/forecast`). Ücretsizdir ve API anahtarı gerektirmez; bu yüzden kodda gizlenmesi gereken bir anahtar yok.

**14. İnternet yoksa ne oluyor?**
`fetch` hata fırlatır. `services/http.ts` bunu yakalayıp "İnternet bağlantısı kurulamadı..." mesajına çevirir. Hook bu mesajı `error` state'ine yazar, ekran `ErrorView` ile mesajı ve "Tekrar dene" butonunu gösterir. Uygulama çökmez. Favoriler ekranında şehir listesi yine görünür (veritabanından gelir), sadece sıcaklıklar yerine "--" yazar.

**15. Timeout'u nasıl yaptın? `AbortController` nedir?**
`AbortController` bir isteği iptal etmeye yarar. `fetchJson` içinde `setTimeout` ile 10 saniyelik zamanlayıcı kuruyorum; süre dolarsa `controller.abort()` çağrılır ve `fetch` "AbortError" ile durur. Bunu "İstek zaman aşımına uğradı" mesajına çeviriyorum. İstek zamanında biterse `finally` içinde `clearTimeout` ile zamanlayıcı temizlenir.

**16. Debounce nedir, neden kullandın?**
Kullanıcı "izmir" yazarken her harfte istek atmak (5 istek) gereksizdir. Debounce, kullanıcı yazmayı 400 ms bıraktıktan sonra tek istek atılmasını sağlar. `useDebounce` hook'u her değişiklikte bir zamanlayıcı kurar; değer süre dolmadan tekrar değişirse eski zamanlayıcıyı iptal eder (`clearTimeout`).

**17. Arama ekranındaki `cancelled` değişkeni ne işe yarıyor?**
Yarış durumunu (race condition) önler. "iz" için atılan isteğin cevabı, "izmir" için atılanınkinden sonra gelirse eski sonuç yenisinin üzerine yazılırdı. Arama metni değişince `useEffect`'in temizlik fonksiyonu `cancelled = true` yapar; eski isteğin cevabı gelse bile state'e yazılmaz.

**18. API'den gelen saatlik veriyi nasıl işledin?**
Open-Meteo paralel diziler gönderir (`time[]`, `temperature_2m[]`...). `map` ile aynı indeksteki değerleri tek nesnede birleştiriyorum. Veri 00:00'dan başladığı için şu anki saatin indeksini `findIndex` ile bulup `slice` ile oradan 24 saat alıyorum.

**19. `weather_code` nedir, ekranda nasıl "Parçalı bulutlu" yazıyor?**
WMO'nun (Dünya Meteoroloji Örgütü) standart hava durumu kodudur (0 = açık, 61 = hafif yağmur...). `utils/weatherCodes.ts` içindeki tablo her kodu Türkçe açıklamaya ve gündüz/gece ikonuna çevirir. Tabloda olmayan kod gelirse "Bilinmiyor" döner, uygulama çökmez.

**20. `timezone=auto` neden var?**
Saatlerin, sorgulanan şehrin yerel saatiyle gelmesi için. Olmasaydı saatler GMT olarak gelir, saatlik tahmin ve gün sınırları yanlış görünürdü.

**21. Neden axios kullanmadın?**
`fetch` React Native'de yerleşik ve ihtiyacımı karşılıyor. Ek paket eklemek projeyi gereksiz büyütürdü.

### Veritabanı

**22. Favoriler nerede saklanıyor?**
Telefonda, `expo-sqlite` ile açılan `weather.db` adlı SQLite veritabanının `favorites` tablosunda. Uygulama kapansa da veriler kalır; uygulama silinirse veriler de silinir. Sunucuya hiçbir şey gönderilmez.

**23. Aynı şehrin iki kez eklenmesini nasıl engelledin?**
İki katmanda: tabloda `id` sütunu `PRIMARY KEY` (aynı id iki kez olamaz) ve ekleme sorgusu `INSERT OR IGNORE` (aynı id varsa hata vermeden atlar). Ayrıca arayüzde şehir zaten favoriyse kalp dolu görünür ve dokunmak eklemez, çıkarmayı sorar.

**24. Parametreli sorgu nedir, neden önemli?**
Değerleri SQL metnine yapıştırmak yerine `?` yer tutucusuyla ayrı göndermektir: `db.runAsync('DELETE FROM favorites WHERE id = ?', [id])`. Böylece değer içinde tırnak veya SQL komutu olsa bile sorgu olarak çalıştırılmaz; SQL injection engellenir.

**25. Neden AsyncStorage değil de SQLite?**
Favoriler satır-sütun yapısında bir liste; SQLite ile sıralama (`ORDER BY`), tekil kayıt kontrolü (`PRIMARY KEY`) ve tek satır silme doğrudan yapılabiliyor. Ayrıca proje şartı SQLite idi.

**26. Veritabanında neden sıcaklık saklamıyorsun?**
Sıcaklık sürekli değişen veridir; saklasam eski kalırdı. Sadece kalıcı bilgiyi (şehir id, ad, koordinat) saklıyor, sıcaklığı her seferinde API'den taze alıyorum.

**27. Favoriler ekranında 10 şehir varsa kaç istek atılıyor?**
Bir. Open-Meteo virgülle ayrılmış birden fazla koordinat kabul ediyor; `getCurrentSummaries` tüm şehirleri tek istekte soruyor.

### Navigation, stil, izinler

**28. Expo Router nasıl çalışıyor?**
`app/` klasöründeki her dosya bir ekran, dosya yolu ekranın adresi. `_layout.tsx` dosyaları ekranların Stack mi Tabs mı olacağını belirler. Ayrıca bir route listesi yazmaya gerek yok.

**29. `[id].tsx` dosya adındaki köşeli parantez ne demek?**
Dinamik route. `/city/311046`, `/city/745044` gibi her adres aynı dosyaya gider; `id` değeri `useLocalSearchParams()` ile okunur.

**30. `(tabs)` klasöründeki parantez ne demek?**
Grup demek. Dosyaları bir layout altında toplar ama adrese eklenmez; `(tabs)/index.tsx`'in adresi `/`'dir.

**31. Şehir bilgisi arama ekranından detay ekranına nasıl geçiyor?**
URL parametreleriyle. `router.push({ pathname: '/city/[id]', params: { id, name, country, latitude, longitude } })`. Detay ekranı `useLocalSearchParams` ile okur; parametreler metin geldiği için `Number()` ile sayıya çevirir.

**32. NativeWind nedir? `className` React Native'de normalde çalışır mı?**
Çalışmaz. NativeWind, Tailwind sınıflarını derleme sırasında React Native stil nesnelerine çevirir ve Babel ayarı sayesinde `className`'i bileşenin `style`'ına bağlar.

**33. `SafeAreaView` neden kullanıldı?**
iPhone'daki çentik/Dynamic Island ve alttaki çizgi içeriğin üzerine gelmesin diye. `edges={['top']}` ile sadece gereken kenara boşluk veriyorum (alt kenarı tab bar zaten hallediyor).

**34. Konum izni reddedilirse uygulama ne yapıyor?**
Çökmez; İstanbul'u varsayılan olarak gösterir ve üstte nazik bir bilgi mesajı çıkarır. Kullanıcı arama ile istediği şehre bakabilir.

**35. Favoriden silerken neden onay soruyorsun, nasıl yaptın?**
Yanlışlıkla silmeyi önlemek için. `utils/confirm.ts` içinde React Native'in `Alert.alert` fonksiyonuyla "Vazgeç" ve "Sil" butonlu bir pencere açılıyor; silme işlemi sadece "Sil"e basılınca çalışıyor.

**36. Pull-to-refresh nasıl çalışıyor?**
`ScrollView` (ve favorilerde `FlatList`) bileşenine `refreshControl={<RefreshControl refreshing={...} onRefresh={...} />}` veriliyor. Kullanıcı aşağı çekince `onRefresh` çalışır, veri yeniden istenir; `refreshing` true iken üstte gösterge döner.

**37. `FlatList` ile `ScrollView` + `map` arasındaki fark ne? Hangisini nerede kullandın?**
`FlatList` sadece ekranda görünen satırları çizer, uzun listelerde verimlidir; saatlik tahmin (24 öğe, yatay), arama sonuçları ve favorilerde kullandım. 7 günlük tahmin sadece 7 satır olduğu ve zaten bir `ScrollView` içinde olduğu için `map` ile çizdim.

**38. TypeScript sana ne kazandırdı?**
Veri şekilleri `types/weather.ts`'de tanımlı. Örneğin `current.temprature` gibi yanlış yazılmış bir alan veya var olmayan bir ikon adı daha kod yazarken hata verir. `npx tsc --noEmit` ile tüm projeyi kontrol edebiliyorum.

**39. Yeni bir bilgi (örn. UV indeksi) eklemek için hangi dosyaları değiştirirsin?**
Dört dosya, katman sırasıyla:
1. `services/weather.ts`: URL'deki `current=` listesine `uv_index` ekle, `ForecastResponse` tipine `uv_index: number` ekle, dönüşümde `uvIndex: data.current.uv_index` yaz.
2. `types/weather.ts`: `CurrentWeather` tipine `uvIndex: number` ekle.
3. `components/CurrentWeatherCard.tsx`: Nem ve rüzgarın yanına üçüncü bir kutu ekle.
4. (Gerekirse) ikon için `MaterialCommunityIcons`'tan `white-balance-sunny` gibi bir ad seç.
Ekran dosyalarına (`app/`) dokunmaya gerek yok; hem ana ekran hem detay ekranı aynı kartı kullandığı için ikisinde de görünür.

**40. Uygulamayı Android'de de çalıştırabilir misin?**
Evet. Kod platforma özel bir şey içermiyor; Android'de Expo Go ile aynı QR kod okutularak açılır. Android konum izinleri `app.json`'da tanımlı.

---

## 13. Sınavda canlı yapılabilecek 5 küçük değişiklik

Her biri tek dosyada, birkaç satırlık değişikliktir. Kaydedince Expo Go'da ekran kendiliğinden yenilenir.

### 1. Varsayılan şehri İstanbul yerine Ankara yap

**Dosya:** `hooks/useLocation.ts`

```ts
// Eski
const DEFAULT_PLACE: Place = { name: 'İstanbul', latitude: 41.0138, longitude: 28.9497 };
// Yeni
const DEFAULT_PLACE: Place = { name: 'Ankara', latitude: 39.9334, longitude: 32.8597 };
```

Aynı dosyadaki iki bilgi mesajında geçen "İstanbul" kelimesini de "Ankara" yap. (Test için telefonun ayarlarından Expo Go'nun konum iznini kapatman gerekir.)

### 2. Aramanın başlaması için gereken harf sayısını 2'den 3'e çıkar

**Dosya:** `app/search.tsx`

```ts
// Eski
const MIN_LENGTH = 2;
// Yeni
const MIN_LENGTH = 3;
```

Aynı dosyadaki `"Aramak için en az 2 harf yazın."` metnini de `3` yap. (Debounce süresini değiştirmek istenirse aynı dosyada `useDebounce(query.trim(), 400)` içindeki `400`'ü değiştir.)

### 3. Bir hava durumu açıklamasını veya ikonunu değiştir

**Dosya:** `utils/weatherCodes.ts`

```ts
// Eski
0: { description: 'Açık', dayIcon: 'weather-sunny', nightIcon: 'weather-night' },
// Yeni
0: { description: 'Güneşli', dayIcon: 'weather-sunny', nightIcon: 'weather-night' },
```

### 4. Ana kartın rengini değiştir

**Dosya:** `components/CurrentWeatherCard.tsx`

```tsx
// Eski
<View className="items-center rounded-3xl bg-sky-500 p-6">
// Yeni
<View className="items-center rounded-3xl bg-indigo-500 p-6">
```

Aynı dosyada `text-sky-100` ve `border-sky-400` sınıflarını da `text-indigo-100` ve `border-indigo-400` yaparsan renkler uyumlu olur.

### 5. Anlık karta yeni bir bilgi ekle (örn. UV indeksi)

**Dosyalar:** `services/weather.ts`, `types/weather.ts`, `components/CurrentWeatherCard.tsx`

`services/weather.ts`:

```ts
// 1) ForecastResponse içindeki current tipine ekle
uv_index: number;

// 2) URL'deki current listesinin sonuna ekle
'&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day,uv_index' +

// 3) Dönüşümde current nesnesine ekle
uvIndex: data.current.uv_index,
```

`types/weather.ts` → `CurrentWeather` tipine:

```ts
uvIndex: number; // UV indeksi
```

`components/CurrentWeatherCard.tsx` → rüzgar kutusunun (`</View>`) hemen altına:

```tsx
<View className="items-center">
  <MaterialCommunityIcons name="white-balance-sunny" size={24} color="white" />
  <Text className="mt-1 text-base font-semibold text-white">{Math.round(current.uvIndex)}</Text>
  <Text className="text-xs text-sky-100">UV</Text>
</View>
```

### Ek küçük fikirler

- **Saatlik tahmini 24 yerine 12 saat göster:** `services/weather.ts` içinde `.slice(startIndex, startIndex + 24)` → `+ 12`.
- **Zaman aşımını 10 yerine 5 saniye yap:** `services/http.ts` içinde `TIMEOUT_MS = 10000` → `5000`.
- **Tab adını değiştir:** `app/(tabs)/_layout.tsx` içinde `title: 'Favoriler'` → `title: 'Şehirlerim'`.
- **Favorileri alfabetik sırala:** `db/favorites.ts` içinde `ORDER BY created_at ASC` → `ORDER BY name ASC`.
- **Rüzgarı m/s göster:** `services/weather.ts` URL'ine `'&wind_speed_unit=ms'` ekle ve `CurrentWeatherCard.tsx` içinde `km/s` yazısını `m/s` yap.
