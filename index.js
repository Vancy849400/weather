// 1. Select DOM Elements (Only select the element references)
const searchInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const icon = document.getElementById("weather-icon");
const temp = document.getElementById("temp-display");
const cityDisplay = document.getElementById("city-display");
const humidityValue = document.getElementById("humidity-value");
const windValue = document.getElementById("wind-value");
const errorMsg = document.getElementById("error-message");

// 2. Constants for API Key and Base URL
const API_KEY = "67310d122e534413b94121938250512";
const BASE_URL = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&aqi=no&q=`;

/**
 * @param {string} location The city name or location to search for.
 */
async function getweather(location) {
  // 3. Construct the dynamic URL
  const fullUrl = BASE_URL + encodeURIComponent(location); // Use encodeURIComponent for safety

  // Set loading state and hide errors
  cityDisplay.textContent = "Loading...";
  errorMsg.classList.add("hidden");

  try {
    const response = await fetch(fullUrl);

    // API returns 400 for 'city not found'
    if (response.status === 400) {
      throw new Error("City not found or invalid input.");
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // 4. Update UI with fetched data
    icon.src = data.current.condition.icon;
    temp.textContent = `${Math.round(data.current.temp_c)}°C`;
    cityDisplay.textContent = `${data.location.name}`;
    humidityValue.textContent = `${data.current.humidity}%`;
    windValue.textContent = `${data.current.wind_kph} km/h`;
  } catch (error) {
    // 5. Handle errors
    console.error("Failed to Load data:", error);
    errorMsg.textContent = error.message || "An unknown error occurred.";
    errorMsg.classList.remove("hidden"); // Show the error message

    // Clear display data on error
    cityDisplay.textContent = "—";
    temp.textContent = "—";
    humidityValue.textContent = "—";
    windValue.textContent = "—";
  }
}

// 6. Event Listener to trigger the search
searchBtn.addEventListener("click", () => {
  // Read the current value of the input when the button is clicked!
  const location = searchInput.value.trim().toLowerCase();

  if (location) {
    getweather(location);
  } else {
    errorMsg.textContent = "Please enter a city name.";
    errorMsg.classList.remove("hidden");
  }
});

// 7. Initial Load (Load a default city when the page opens)
getweather("Lusaka");
