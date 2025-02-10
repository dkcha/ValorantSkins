// main.js
import { setupVolumeControl } from "./volumeControl.js";
import { setupSearchBar } from "./searchBar.js";
import { fetchGunDetails } from "./gunDetails.js";

// Get the current gun type from the URL
const params = new URLSearchParams(window.location.search);
const gunType = params.get("type");

// Initialize volume control
setupVolumeControl();

// Fetch and display gun details
fetchGunDetails(gunType).then(() => {
  // Initialize search bar after data is loaded
  setupSearchBar(data, gunType);
});

// Home button functionality
document.getElementById("home-button").addEventListener("click", () => {
  window.location.href = "/";
});
