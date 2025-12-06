// =========================================
// 1. Select DOM Elements
// =========================================
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

// =========================================
// 2. Constants/Config
// =========================================
const API_KEY = "67310d122e534413b94121938250512";
// Using HTTPS endpoint ensures secure requests
const BASE_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&aqi=no&q=`;

// =========================================
// 3. Main Functions
// =========================================

/**
 * Fetches weather data from the API and updates the UI.
 * @param {string} location - The city name to search for.
 */
async function getweather(location) {
  // 1. Construct dynamic URL with safe encoding for city names with spaces/special chars
  const fullUrl = BASE_URL + encodeURIComponent(location);

  // 2. UI State: Show loader, hide weather data & previous errors
  errorMsg.classList.add("hidden");
  weatherDisplay.classList.add("hidden");
  loadingIndicator.classList.remove("hidden");

  try {
    // 3. Make the API Request
    const response = await fetch(fullUrl);

    // 4. Handle specific API errors
    if (response.status === 400) {
      // Status 400 from this API means the city was not found
      throw new Error("City not found. Please check the spelling.");
    }
    if (!response.ok) {
      // Handle other general HTTP errors
      throw new Error(`Weather service error (Status: ${response.status})`);
    }

    const data = await response.json();

    // 5. Update UI with successful data
    // Important: The API returns icon URLs starting with "//", so we prepend "https:"
    icon.src = `https:${data.current.condition.icon}`;
    icon.alt = data.current.condition.text; // Good for accessibility

    temp.textContent = `${Math.round(data.current.temp_c)}°C`;
    // Show City and Country for better context
    cityDisplay.textContent = `${data.location.name}, ${data.location.country}`;
    humidityValue.textContent = `${data.current.humidity}%`;
    windValue.textContent = `${data.current.wind_kph} km/h`;

    // 6. UI State: Hide loader, show weather data
    loadingIndicator.classList.add("hidden");
    weatherDisplay.classList.remove("hidden");

  } catch (error) {
    // 7. Handle Errors Gracefully
    console.error("Weather fetch failed:", error);

    // Display the specific error message to the user
    errorMsg.textContent = error.message;
    errorMsg.classList.remove("hidden");

    // UI State: Hide loader. We keep the weather display hidden so old data isn't shown.
    loadingIndicator.classList.add("hidden");
  }
}

// =========================================
// 4. Event Listeners
// =========================================

// Listener for form submission. This automatically handles both
// clicking the search button AND pressing the "Enter" key in the input.
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Stop the page from reloading

  const location = searchInput.value.trim();

  if (location) {
    getweather(location);
    searchInput.value = ""; // Clear input field after search
    searchInput.blur(); // Remove focus from input (dismisses mobile keyboard)
  } else {
    // Show error if input is empty
    errorMsg.textContent = "Please enter a city name.";
    errorMsg.classList.remove("hidden");
  }
});

// =========================================
// 5. Initial Load
// =========================================
// Load a default city when the page is fully loaded so it's not empty.
document.addEventListener('DOMContentLoaded', () => {
    getweather("Lusaka");
});