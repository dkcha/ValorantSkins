async function fetchGuns() {
  try {
    const response = await fetch("/api/skins");
    const gunsData = await response.json();

    populateGunGrid(gunsData);
  } catch (error) {
    console.error("Error fetching guns:", error);
  }
}

function populateGunGrid(gunsData) {
  const gridContainer = document.getElementById("gun-grid");
  gridContainer.innerHTML = "";

  for (let gunType in gunsData) {
    const gunCard = document.createElement("div");
    gunCard.className = "gun-card";

    gunCard.innerHTML = `
      <img src="/static/images/${gunType.toLowerCase()}.png" alt="${gunType}" class="gun-image">
      <p>${gunType}</p>
    `;

    // Navigate to gun details page with the correct gun type
    gunCard.addEventListener("click", () => {
      window.location.href = `/gun?type=${gunType}`;
    });

    gridContainer.appendChild(gunCard);
  }
}

fetchGuns();
