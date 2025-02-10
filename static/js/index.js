// todo: need to reorganize home page so it's a grid based on Valorant styling and format
async function fetchGuns() {
  try {
    // const response = await fetch("/api/skins");
    // const gunsData = await response.json();

    populateGunGrid();
  } catch (error) {
    console.error("Error fetching guns:", error);
  }
}

function populateGunGrid() {
  document.addEventListener("DOMContentLoaded", () => {
    const gunCards = document.querySelectorAll(".gun-card");

    gunCards.forEach((card) => {
      // Create container for gun image
      const gunImageContainer = document.createElement("div");
      const image = document.createElement("img");
      image.src = `/static/images/${card
        .getAttribute("data-gun-type")
        .toLowerCase()}.png`;
      image.alt = card.getAttribute("data-gun-type");
      image.className = "gun-image";
      gunImageContainer.appendChild(image);
      card.appendChild(gunImageContainer);

      card.addEventListener("click", () => {
        const gunType = card.getAttribute("data-gun-type");
        window.location.href = `/gun?type=${gunType}`;
      });
    });
  });

  // const gridContainer = document.getElementById("gun-grid");
  // gridContainer.innerHTML = "";

  // for (let gunType in gunsData) {
  //   const gunCard = document.createElement("div");
  //   gunCard.className = "gun-card";

  //   gunCard.innerHTML = `
  //     <img src="/static/images/${gunType.toLowerCase()}.png" alt="${gunType}" class="gun-image">
  //     <p>${gunType}</p>
  //   `;

  //   // Navigate to gun details page with the correct gun type
  //   gunCard.addEventListener("click", () => {
  //     window.location.href = `/gun?type=${gunType}`;
  //   });

  //   gridContainer.appendChild(gunCard);
  // }
}

// document.getElementById("refresh-button").addEventListener("click", () => {
//   clearLocalStorage();
//   fetchGunDetails(); // Refetch the data
// });

// function clearLocalStorage() {
//   localStorage.clear();
// }

fetchGuns();
