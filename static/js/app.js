// Function to fetch data from the Flask API and display it
async function fetchAndDisplaySkins() {
  try {
    const response = await fetch("/api/skins");
    const data = await response.json();

    const container = document.getElementById("skins-container");
    container.innerHTML = ""; // Clear the container

    for (const [uuid, skin] of Object.entries(data)) {
      // Create a card for each skin
      const card = document.createElement("div");
      card.className = "card";

      // Display skin name and icon
      card.innerHTML = `
                <h3>${skin.displayName || "No Name"}</h3>
                <img src="${skin.displayIcon || ""}" alt="${
        skin.displayName || "Skin"
      }" width="200">
                <p>UUID: ${uuid}</p>
            `;
      container.appendChild(card);
    }
  } catch (error) {
    console.error("Error fetching skins:", error);
  }
}

// Fetch and display skins when the page loads
window.onload = fetchAndDisplaySkins;
