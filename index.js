// DOM Elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("city-input");
const suggestionsBox = document.getElementById("suggestions");
const loadingIndicator = document.getElementById("loading-indicator");
const weatherDisplay = document.getElementById("weather-display");
const errorMsg = document.getElementById("error-message");
const weatherDescription = document.getElementById("weather-description");

const icon = document.getElementById("weather-icon");
const temp = document.getElementById("temp-display");
const cityDisplay = document.getElementById("city-display");
const humidityValue = document.getElementById("humidity-value");
const windValue = document.getElementById("wind-value");

// API Config
const API_KEY = "67310d122e534413b94121938250512";
const WEATHER_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&aqi=no&q=`;
const SEARCH_URL = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=`;

// Fetch Weather
async function getWeather(city) {
  const url = WEATHER_URL + encodeURIComponent(city);

  errorMsg.classList.add("hidden");
  weatherDisplay.classList.add("hidden");
  loadingIndicator.classList.remove("hidden");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found.");

    const data = await res.json();

    icon.src = `https:${data.current.condition.icon}`;
    weatherDescription.textContent = `${data.current.condition.text}`;
    temp.textContent = `${Math.round(data.current.temp_c)}°C`;
    cityDisplay.textContent = `${data.location.name}, ${data.location.country}`;
    humidityValue.textContent = `${data.current.humidity}%`;
    windValue.textContent = `${data.current.wind_kph} km/h`;

    // save history
    saveHistory(city);

    weatherDisplay.classList.remove("hidden");
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.classList.remove("hidden");
  }

  loadingIndicator.classList.add("hidden");
}

// Default weather on load
document.addEventListener("DOMContentLoaded", () => {
  getWeather("Lusaka");
});

// Submit form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (!city) return;

  getWeather(city);
  searchInput.value = "";
  suggestionsBox.classList.add("hidden");
});

// Local Search History
let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

function saveHistory(city) {
  city = city.trim();
  if (!city) return;

  // remove duplicates
  history = history.filter((x) => x.toLowerCase() !== city.toLowerCase());

  history.unshift(city);
  if (history.length > 8) history.pop();
  localStorage.setItem("weatherHistory", JSON.stringify(history));
}

function deleteHistoryItem(city) {
  history = history.filter((x) => x !== city);
  localStorage.setItem("weatherHistory", JSON.stringify(history));
  showSuggestions(searchInput.value);
}

// API Autocomplete
async function fetchApiSuggestions(query) {
  if (query.length < 2) return [];

  try {
    const res = await fetch(SEARCH_URL + encodeURIComponent(query));
    return await res.json();
  } catch {
    return [];
  }
}

// Render Suggestions
async function showSuggestions(text = "") {
  suggestionsBox.innerHTML = "";

  let filteredHistory = history.filter((h) =>
    h.toLowerCase().startsWith(text.toLowerCase())
  );

  let apiResults = await fetchApiSuggestions(text);

  // If nothing available → hide
  if (filteredHistory.length === 0 && apiResults.length === 0) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  // History Section
  filteredHistory.forEach((city) => {
    const li = document.createElement("li");
    li.className =
      "px-4 py-2 flex justify-between items-center hover:bg-indigo-700 cursor-pointer";

    const cityText = document.createElement("span");
    cityText.textContent = city;
    cityText.className = "w-full";
    cityText.onclick = () => {
      searchInput.value = city;
      getWeather(city);
      suggestionsBox.classList.add("hidden");
    };

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.innerHTML = "❌";
    delBtn.className = "text-red-400 hover:text-red-200 ml-3";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteHistoryItem(city);
    };

    li.appendChild(cityText);
    li.appendChild(delBtn);

    suggestionsBox.appendChild(li);
  });

  // Divider if both exist
  if (filteredHistory.length > 0 && apiResults.length > 0) {
    const divider = document.createElement("li");
    divider.className = "border-t border-gray-700 my-1";
    suggestionsBox.appendChild(divider);
  }

  // API Autocomplete Section
  apiResults.forEach((place) => {
    const li = document.createElement("li");
    li.className =
      "px-4 py-2 hover:bg-indigo-700 cursor-pointer flex items-center gap-2";

    li.innerHTML = `
      <i class="fa-solid fa-location-dot text-indigo-300"></i>
      ${place.name}, ${place.country}
    `;

    li.onclick = () => {
      const cityName = `${place.name}`;
      searchInput.value = cityName;
      getWeather(cityName);
      suggestionsBox.classList.add("hidden");
    };

    suggestionsBox.appendChild(li);
  });

  suggestionsBox.classList.remove("hidden");
}

// Input Events
searchInput.addEventListener("focus", () => {
  showSuggestions(searchInput.value);
});

searchInput.addEventListener("input", () => {
  showSuggestions(searchInput.value);
});

// Hide dropdown when clicking away
document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.classList.add("hidden");
  }
});

// Keyboard Navigation
let selectedIndex = -1;

searchInput.addEventListener("keydown", (e) => {
  const items = suggestionsBox.querySelectorAll("li");
  if (items.length === 0) return;

  if (e.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
  } else if (e.key === "Enter") {
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].click();
    }
    return;
  }

  // highlight
  items.forEach((item, index) =>
    item.classList.toggle("bg-indigo-800", index === selectedIndex)
  );
});
