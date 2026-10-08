# Tugas Rutin 5 — Weather App

## Identitas

- **Nama:** Rahmat Hamonangan Nasution
- **NIM:** 4253250053
- **Kelas:** PSIK 25B
- **Mata Kuliah:** Pemrograman Web
- **Pertemuan:** 5

## Deskripsi

Tugas Rutin 5 merupakan project pembuatan aplikasi cuaca berbasis web menggunakan JavaScript dan API.

Aplikasi ini mengambil data cuaca dari OpenWeatherMap API kemudian menampilkannya dalam bentuk informasi cuaca yang interaktif dan responsif.

Pengguna dapat mencari nama kota untuk melihat kondisi cuaca saat ini, prakiraan cuaca 5 hari, lokasi pada peta, informasi koordinat, zona waktu, waktu matahari terbit dan terbenam, serta informasi cuaca lainnya.

Project ini juga menerapkan konsep JavaScript modern seperti `const/let`, arrow function, template literals, destructuring, async/await, Fetch API, array methods, dan LocalStorage.

## Teknologi

- HTML5
- CSS3
- JavaScript ES6+
- OpenWeatherMap API
- Fetch API
- LocalStorage
- Google Maps Embed

## Fitur Utama

### 1. Pencarian Cuaca Berdasarkan Kota

Pengguna dapat memasukkan nama kota pada search bar untuk mendapatkan informasi cuaca.

Contoh:

```text
Medan
Jakarta
Bandung
Kuala Lumpur
```

Data cuaca diambil menggunakan OpenWeatherMap API.

```javascript
const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;

const res = await fetch(url);
const data = await res.json();
```

### 2. Live Search Suggestions

Aplikasi menyediakan saran nama kota ketika pengguna mengetik pada search bar.

Sistem menggunakan OpenWeatherMap Geocoding API untuk mendapatkan daftar lokasi yang sesuai dengan kata kunci.

Saran hanya mulai ditampilkan setelah pengguna mengetik minimal 3 karakter.

```javascript
if (query.length < 3) {
    suggestionBox.classList.add("hidden");
    return;
}
```

Aplikasi juga menggunakan debounce selama 400 ms agar request API tidak dikirim pada setiap karakter yang diketik.

### 3. Informasi Cuaca Saat Ini

Setelah kota berhasil ditemukan, aplikasi menampilkan:

- Nama kota
- Ikon cuaca
- Temperatur
- Deskripsi cuaca
- Kelembaban
- Kecepatan angin
- Temperatur yang terasa

Data tersebut diambil dari response OpenWeatherMap API.

### 4. Toggle Celsius dan Fahrenheit

Pengguna dapat mengubah satuan temperatur antara:

- Celsius (°C)
- Fahrenheit (°F)

Tombol satuan tersedia pada bagian hasil cuaca.

Konversi Fahrenheit menggunakan rumus:

```text
°F = (°C × 9/5) + 32
```

Implementasi JavaScript:

```javascript
const toFahrenheit = (c) => (c * 9) / 5 + 32;
```

Perubahan satuan dilakukan tanpa melakukan request API ulang.

### 5. Prakiraan Cuaca 5 Hari

Aplikasi mengambil data forecast dari OpenWeatherMap API.

Data forecast kemudian difilter untuk mengambil data pada pukul 12:00 setiap hari sehingga ditampilkan sebagai prakiraan 5 hari.

```javascript
const dailyForecast = data.list.filter(
    (item) => item.dt_txt.includes("12:00:00")
);
```

Setiap kartu forecast menampilkan:

- Nama hari
- Ikon cuaca
- Temperatur

### 6. Dynamic Weather Theme

Background aplikasi berubah berdasarkan kondisi cuaca.

Beberapa kondisi yang digunakan:

- Clear
- Clouds
- Rain
- Drizzle
- Thunderstorm
- Snow
- Mist
- Fog
- Haze

Mapping kondisi cuaca dilakukan menggunakan object:

```javascript
const WEATHER_THEME_MAP = {
    Clear: "clear",
    Clouds: "clouds",
    Rain: "rain",
    Drizzle: "rain",
    Thunderstorm: "thunderstorm",
    Snow: "snow",
    Mist: "mist",
    Fog: "mist",
    Haze: "mist",
};
```

Kondisi `Clear` juga dibedakan antara siang dan malam berdasarkan icon cuaca.

### 7. Riwayat Pencarian

Aplikasi menyimpan riwayat kota yang pernah dicari menggunakan `localStorage`.

Maksimal terdapat 5 riwayat pencarian.

```javascript
const MAX_HISTORY = 5;
```

Riwayat juga tidak menyimpan kota yang sama secara berulang.

Data disimpan menggunakan:

```javascript
localStorage.setItem(
    "weatherHistory",
    JSON.stringify(updated)
);
```

Ketika halaman dibuka kembali, riwayat pencarian akan ditampilkan kembali.

### 8. Loading State

Ketika aplikasi sedang mengambil data dari API, ditampilkan loading state.

```javascript
const showLoading = () => {
    introState.classList.add("hidden");
    loading.classList.remove("hidden");
};
```

Setelah proses selesai, loading akan disembunyikan.

### 9. Error Handling

Aplikasi menangani beberapa kondisi error.

Contohnya:

- Kota tidak ditemukan
- Server error
- Tidak dapat terhubung ke internet

Jika kota tidak ditemukan:

```javascript
if (res.status === 404) {
    throw new Error(
        `Kota "${city}" tidak ditemukan. Coba periksa ejaannya.`
    );
}
```

Jika terjadi masalah koneksi, aplikasi menampilkan pesan:

```text
Gagal terhubung ke internet. Periksa koneksi kamu.
```

### 10. Lokasi pada Peta

Aplikasi menampilkan lokasi kota menggunakan koordinat latitude dan longitude dari API.

Google Maps digunakan melalui iframe:

```javascript
document.querySelector("#mapFrame").src =
    `https://www.google.com/maps?q=${lat},${lon}&output=embed`;
```

Pengguna juga dapat membuka lokasi tersebut langsung melalui Google Maps.

### 11. Informasi Lokasi

Selain cuaca, aplikasi menampilkan informasi:

- Negara
- Koordinat
- Zona waktu
- Matahari terbit
- Matahari terbenam

Zona waktu dikonversi dari offset API menjadi format seperti:

```text
UTC+7
```

Waktu sunrise dan sunset dikonversi dari Unix timestamp menjadi format waktu lokal.

### 12. Responsive Design

Tampilan aplikasi dibuat responsif sehingga dapat digunakan pada berbagai ukuran layar.

Elemen seperti:

- Search bar
- Weather result
- Forecast cards
- Map
- Informasi lokasi

menyesuaikan ukuran layar perangkat.

## Konsep JavaScript yang Digunakan

### 1. `const` dan `let`

Digunakan untuk mendeklarasikan variabel dan state aplikasi.

Contoh:

```javascript
const BASE_URL = "...";
const MAX_HISTORY = 5;

let lastWeatherData = null;
let currentUnit = "C";
```

### 2. Arrow Function

Digunakan pada berbagai fungsi dalam aplikasi.

Contoh:

```javascript
const showLoading = () => {
    loading.classList.remove("hidden");
};
```

### 3. Template Literals

Digunakan untuk membuat URL API dan menghasilkan HTML secara dinamis.

Contoh:

```javascript
const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
```

### 4. Destructuring

Destructuring digunakan untuk mengambil data tertentu dari response JSON.

Contoh:

```javascript
const {
    name,
    coord: { lat, lon },
    main: { temp, humidity, feels_like },
    weather: [{ main: weatherMain, description, icon }],
    wind: { speed },
    sys: { country, sunrise, sunset },
    timezone,
} = data;
```

### 5. Async/Await

Digunakan untuk menangani proses pengambilan data dari API secara asynchronous.

Contoh:

```javascript
const getWeather = async (city) => {
    const res = await fetch(url);
    const data = await res.json();
};
```

### 6. Fetch API

Fetch API digunakan untuk melakukan HTTP request ke OpenWeatherMap API.

API yang digunakan meliputi:

```text
Current Weather API
Forecast API
Geocoding API
```

### 7. Array Methods

Beberapa array methods digunakan dalam project, seperti:

- `filter()`
- `map()`
- `join()`
- `slice()`

Contoh:

```javascript
const dailyForecast = data.list.filter(
    (item) => item.dt_txt.includes("12:00:00")
);
```

### 8. LocalStorage

LocalStorage digunakan untuk menyimpan riwayat pencarian kota sehingga data tetap tersedia ketika halaman dibuka kembali.

## API yang Digunakan

### OpenWeatherMap Current Weather API

Digunakan untuk mendapatkan kondisi cuaca saat ini.

```text
https://api.openweathermap.org/data/2.5/weather
```

### OpenWeatherMap Forecast API

Digunakan untuk mendapatkan data prakiraan cuaca.

```text
https://api.openweathermap.org/data/2.5/forecast
```

### OpenWeatherMap Geocoding API

Digunakan untuk mendapatkan saran lokasi berdasarkan input pencarian.

```text
https://api.openweathermap.org/geo/1.0/direct
```

## Konfigurasi API Key

API key tidak disimpan langsung di repository.

Project menyediakan file:

```text
config.example.js
```

File tersebut berisi template:

```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```

Untuk menjalankan aplikasi:

1. Buat akun OpenWeatherMap.
2. Dapatkan API key.
3. Copy `config.example.js`.
4. Rename hasil copy menjadi:

```text
config.js
```

5. Ganti:

```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```

menjadi API key milik sendiri.

Contoh:

```javascript
const API_KEY = "API_KEY_MILIK_SENDIRI";
```

Jangan memasukkan API key asli ke README atau repository publik.

## Struktur Project

```text
TugasWeb-Pertemuan5-WeatherApp/
├── .gitignore
├── app.js
├── config.example.js
├── index.html
└── style.css
```

File `config.js` digunakan secara lokal untuk menyimpan API key dan tidak dimasukkan ke repository.

## Alur Kerja Aplikasi

```text
User memasukkan nama kota
            ↓
Live Search Suggestions
            ↓
Geocoding API
            ↓
User memilih kota
            ↓
Current Weather API
            ↓
Menampilkan cuaca saat ini
            ↓
Forecast API
            ↓
Menampilkan prakiraan 5 hari
            ↓
Menampilkan lokasi + informasi tambahan
            ↓
Menyimpan kota ke LocalStorage
```

## Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/rhmtnst/TugasWeb-Pertemuan5-WeatherApp.git
```

### 2. Masuk ke Folder Project

```bash
cd TugasWeb-Pertemuan5-WeatherApp
```

### 3. Buat File Konfigurasi

Copy:

```text
config.example.js
```

menjadi:

```text
config.js
```

Kemudian masukkan API key OpenWeatherMap milik sendiri.

### 4. Jalankan Project

Project dapat dijalankan menggunakan Live Server atau web server lokal.

Kemudian buka:

```text
index.html
```

### 5. Gunakan Aplikasi

Masukkan nama kota pada search bar, kemudian pilih kota dari hasil saran atau tekan tombol pencarian.

## Pengembangan yang Dipelajari

Melalui project ini, beberapa konsep penting Pemrograman Web dipraktikkan:

- Penggunaan JavaScript modern
- Integrasi REST API
- Fetch API
- Async/Await
- JSON response
- DOM manipulation
- Event listener
- Array methods
- Destructuring
- Template literals
- LocalStorage
- Error handling
- Responsive design
- Dynamic UI

## Repository

GitHub:

https://github.com/rhmtnst/TugasWeb-Pertemuan5-WeatherApp

