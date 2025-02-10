// gunDetails.js
import { showSkinDetails } from "./skinDetails.js";

let selectedSkin = null;

export async function fetchGunDetails(gunType) {
  if (!gunType) {
    console.error("No gun type specified");
    return;
  }

  const cachedData = localStorage.getItem(gunType);
  if (cachedData) {
    const data = JSON.parse(cachedData);
    displayGunDetails(data, gunType);
  } else {
    try {
      const response = await fetch(`/api/gun/skins/${gunType}`);
      const gunData = await response.json();
      localStorage.setItem(gunType, JSON.stringify(gunData));
      displayGunDetails(gunData, gunType);
    } catch (error) {
      console.error("Error fetching gun details:", error);
    }
  }
}

function displayGunDetails(gunData, gunType) {
  const skinContainer = document.getElementById("skin-container");
  skinContainer.innerHTML = "";

  for (let displayName in gunData) {
    const skin = gunData[displayName];

    const skinCard = document.createElement("div");
    skinCard.className = "skin-card";

    const imageSrc = findImageSource(skin, gunType);

    skinCard.innerHTML = `
      <img src="${imageSrc}" alt="${displayName}" class="skin-image">
      <p>${displayName}</p>
    `;

    skinCard.addEventListener("click", () => {
      if (selectedSkin) {
        selectedSkin.classList.remove("selected");
        selectedSkin = null;
      }

      skinCard.classList.add("selected");
      selectedSkin = skinCard;
      showSkinDetails(skin, gunType, imageSrc);
    });

    skinContainer.appendChild(skinCard);
  }
}
