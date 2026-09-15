// =========================================================
// WEATHER APP — Tugas Rutin 5
// ES6+: const/let, arrow function, template literals,
// destructuring, async/await, Fetch API, array methods
// =========================================================

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";
const MAX_HISTORY = 5;

// ---- DOM Elements ----
const form = document.querySelector("#searchForm");
const input = document.querySelector("#cityInput");
const suggestionBox = document.querySelector("#suggestionBox");
const loading = document.querySelector("#loading");
const errorBox = document.querySelector("#error");
const result = document.querySelector("#weatherResult");
const introState = document.querySelector("#introState");

const historyWrapper = document.querySelector("#historyWrapper");
const historyList = document.querySelector("#historyList");

const unitButtons = document.querySelectorAll(".unit-btn");

// State sederhana: data cuaca terakhir & satuan yang aktif
let lastWeatherData = null;
let currentUnit = "C";

// =========================================================
// TEMA DINAMIS — ganti gradasi background sesuai kondisi cuaca
// =========================================================
// Peta kode cuaca OpenWeatherMap ("main") ke nama tema di CSS
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

const applyTheme = (weatherMain, icon) => {
  const isNight = icon.endsWith("n");
  let theme = WEATHER_THEME_MAP[weatherMain] || "clouds";

  // Khusus "Clear" dibedakan siang/malam
  if (theme === "clear") {
    theme = isNight ? "clear-night" : "clear-day";
  }

  document.body.dataset.theme = theme;
};

const resetTheme = () => {
  document.body.dataset.theme = "default";
};

// =========================================================
// UI HELPERS
// =========================================================
const showLoading = () => {
  introState.classList.add("hidden");
  loading.classList.remove("hidden");
};
const hideLoading = () => loading.classList.add("hidden");

const showError = (message) => {
  introState.classList.add("hidden");
  errorBox.textContent = `⚠️ ${message}`;
  errorBox.classList.remove("hidden");
  resetTheme();
};
const hideError = () => errorBox.classList.add("hidden");

// =========================================================
// LOCALSTORAGE — Riwayat Pencarian (Bonus)
// =========================================================
const getHistory = () => {
  const saved = localStorage.getItem("weatherHistory");
  return saved ? JSON.parse(saved) : [];
};

const saveToHistory = (city) => {
  // Destructuring + spread + array method (filter) sekaligus di sini
  const current = getHistory();
  const withoutDuplicate = current.filter(
    (item) => item.toLowerCase() !== city.toLowerCase()
  );
  const updated = [city, ...withoutDuplicate].slice(0, MAX_HISTORY);
  localStorage.setItem("weatherHistory", JSON.stringify(updated));
  renderHistory();
};

const renderHistory = () => {
  const history = getHistory();

  if (history.length === 0) {
    historyWrapper.classList.add("hidden");
    return;
  }

  historyWrapper.classList.remove("hidden");

  // Array method: map() untuk generate HTML tiap chip riwayat
  historyList.innerHTML = history
    .map((city) => `<button class="history-chip" data-city="${city}">${city}</button>`)
    .join("");

  // Pasang event listener ke tiap chip yang baru dibuat
  document.querySelectorAll(".history-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const { city } = chip.dataset;
      input.value = city;
      getWeather(city);
    });
  });
};

// =========================================================
// FETCH WEATHER — inti dari async/await + Fetch API
// =========================================================
const getWeather = async (city) => {
  hideError();
  result.classList.add("hidden");
  showLoading();

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;
    const res = await fetch(url);

    if (res.status === 404) {
      throw new Error(`Kota "${city}" tidak ditemukan. Coba periksa ejaannya.`);
    }
    if (!res.ok) {
      throw new Error(`Server error (${res.status}). Coba lagi nanti.`);
    }

    const data = await res.json();
    lastWeatherData = data;
    displayWeather(data);
    saveToHistory(data.name);
    await getForecast(city);

  } catch (err) {
    if (err instanceof TypeError) {
      // TypeError biasanya berarti gagal konek (bukan error dari server)
      showError("Gagal terhubung ke internet. Periksa koneksi kamu.");
    } else {
      showError(err.message);
    }
  } finally {
    hideLoading();
  }
};

// =========================================================
// DISPLAY WEATHER — pakai destructuring buat baca data JSON
// =========================================================
const displayWeather = (data) => {
  // Destructuring nested object, sekaligus array destructuring untuk weather[0]
  const {
  name,
  coord: { lat, lon },
  main: { temp, humidity, feels_like },
  weather: [{ main: weatherMain, description, icon }],
  wind: { speed },
  sys: { country, sunrise, sunset },
  timezone,
} = data;

  applyTheme(weatherMain, icon);

  document.querySelector("#cityName").textContent = name;
  document.querySelector("#weatherIcon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  document.querySelector("#description").textContent = description;
  document.querySelector("#humidity").textContent = `${humidity}%`;
  document.querySelector("#wind").textContent = `${speed} m/s`;

  renderTemperature(temp, feels_like);
  document.querySelector("#mapFrame").src = `https://www.google.com/maps?q=${lat},${lon}&output=embed`;
  document.querySelector("#mapLink").href = `https://www.google.com/maps?q=${lat},${lon}`;
  renderInfo({ country, lat, lon, timezone, sunrise, sunset });

  result.classList.remove("hidden");
};

const getForecast = async (city) => {
  try {
    const url = `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;
    const res = await fetch(url);
    if (!res.ok) return;

    const data = await res.json();

    // Ambil cuma data jam 12 siang tiap hari (5 kartu)
    const dailyForecast = data.list.filter((item) => item.dt_txt.includes("12:00:00"));

    renderForecast(dailyForecast);
  } catch (err) {
    console.error("Gagal ambil forecast:", err);
  }
};

const renderForecast = (dailyForecast) => {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const forecastList = document.querySelector("#forecastList");

  forecastList.innerHTML = dailyForecast
    .map((item) => {
      const date = new Date(item.dt * 1000);
      const dayName = dayNames[date.getDay()];
      const temp = Math.round(item.main.temp);
      const icon = item.weather[0].icon;

      return `
        <div class="forecast-card">
          <p class="forecast-day">${dayName}</p>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
          <p class="forecast-temp">${temp}°</p>
        </div>
      `;
    })
    .join("");
};

const renderInfo = ({ country, lat, lon, timezone, sunrise, sunset }) => {
  // timezone dari API dalam detik, dibagi 3600 buat jadi format "UTC+7"
  const offsetHours = timezone / 3600;
  const utcLabel = `UTC${offsetHours >= 0 ? "+" : ""}${offsetHours}`;

  // sunrise & sunset dalam Unix timestamp (detik), dikali 1000 buat jadi milidetik
  const formatTime = (unixSeconds) => {
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  document.querySelector("#infoCountry").textContent = country;
  document.querySelector("#infoCoord").textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  document.querySelector("#infoTimezone").textContent = utcLabel;
  document.querySelector("#infoSunrise").textContent = formatTime(sunrise);
  document.querySelector("#infoSunset").textContent = formatTime(sunset);
};

// Konversi & tampilkan suhu sesuai satuan aktif (Bonus: toggle °C/°F)
const renderTemperature = (tempCelsius, feelsLikeCelsius) => {
  const toFahrenheit = (c) => (c * 9) / 5 + 32;

  const temp = currentUnit === "C" ? tempCelsius : toFahrenheit(tempCelsius);
  const feels = currentUnit === "C" ? feelsLikeCelsius : toFahrenheit(feelsLikeCelsius);

  document.querySelector("#temperature").textContent = `${Math.round(temp)}°${currentUnit}`;
  document.querySelector("#feelsLike").textContent = `${Math.round(feels)}°${currentUnit}`;
};

// =========================================================
// EVENT LISTENERS
// =========================================================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (city) getWeather(city);
});

unitButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentUnit = btn.dataset.unit;

    unitButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Kalau ada data cuaca aktif, re-render suhunya tanpa fetch ulang
    if (lastWeatherData) {
      const { main } = lastWeatherData;
      renderTemperature(main.temp, main.feels_like);
    }
  });
});

// Render riwayat pencarian begitu halaman dibuka
renderHistory();

// =========================================================
// LIVE SEARCH SUGGESTIONS (pakai Geocoding API)
// =========================================================
let debounceTimer = null;

input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = input.value.trim();

  if (query.length < 3) {
    suggestionBox.classList.add("hidden");
    return;
  }

  // Debounce: tunggu 400ms setelah user berhenti ngetik, biar nggak fetch tiap huruf
  debounceTimer = setTimeout(() => fetchSuggestions(query), 400);
});

const fetchSuggestions = async (query) => {
  try {
    const url = `${GEOCODE_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
    const res = await fetch(url);
    const results = await res.json();

    renderSuggestions(results);
  } catch (err) {
    console.error("Gagal ambil saran kota:", err);
  }
};

const renderSuggestions = (results) => {
  if (results.length === 0) {
    suggestionBox.classList.add("hidden");
    return;
  }

  suggestionBox.innerHTML = `
    <p class="suggestion-label">Hasil Pencarian</p>
    ${results
      .map((item) => {
        const label = [item.name, item.state, item.country].filter(Boolean).join(", ");
        return `<button type="button" class="suggestion-item" data-city="${item.name}">📍 ${label}</button>`;
      })
      .join("")}
  `;

  suggestionBox.classList.remove("hidden");

  document.querySelectorAll(".suggestion-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { city } = btn.dataset;
      input.value = city;
      suggestionBox.classList.add("hidden");
      getWeather(city);
    });
  });
};

// Sembunyikan saran kalau klik di luar search bar
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-bar") && !e.target.closest("#suggestionBox")) {
    suggestionBox.classList.add("hidden");
  }
});