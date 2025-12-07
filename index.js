// -----------------------------------------
// DOM Elements
// -----------------------------------------
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("city-input");
const loadingIndicator = document.getElementById("loading-indicator");
const weatherDisplay = document.getElementById("weather-display");
const errorMsg = document.getElementById("error-message");

const icon = document.getElementById("weather-icon");
const temp = document.getElementById("temp-display");
const cityDisplay = document.getElementById("city-display");
const humidityValue = document.getElementById("humidity-value");
const windValue = document.getElementById("wind-value");

// -----------------------------------------
// API Config
// -----------------------------------------
const API_KEY = "67310d122e534413b94121938250512";
const BASE_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&aqi=no&q=`;

// -----------------------------------------
// Fetch Weather
// -----------------------------------------
async function getWeather(city) {
  const url = BASE_URL + encodeURIComponent(city);

  errorMsg.classList.add("hidden");
  weatherDisplay.classList.add("hidden");
  loadingIndicator.classList.remove("hidden");

  try {
    const res = await fetch(url);

    if (res.status === 400) throw new Error("City not found.");
    if (!res.ok) throw new Error("Weather service error.");

    const data = await res.json();

    icon.src = `https:${data.current.condition.icon}`;
    icon.alt = data.current.condition.text;

    temp.textContent = `${Math.round(data.current.temp_c)}°C`;
    cityDisplay.textContent = `${data.location.name}, ${data.location.country}`;
    humidityValue.textContent = `${data.current.humidity}%`;
    windValue.textContent = `${data.current.wind_kph} km/h`;

    weatherDisplay.classList.remove("hidden");
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.classList.remove("hidden");
  }

  loadingIndicator.classList.add("hidden");
}

// -----------------------------------------
// Form Submit
// -----------------------------------------
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const city = searchInput.value.trim();
  if (!city) {
    errorMsg.textContent = "Please enter a city name.";
    errorMsg.classList.remove("hidden");
    return;
  }

  getWeather(city);
  searchInput.value = "";
  searchInput.blur();
});

// -----------------------------------------
// Default Load
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  getWeather("Lusaka");
});
