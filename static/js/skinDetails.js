// skinDetails.js
import { isNotEmptyArray } from "./utils.js";

export function showSkinDetails(skin, gunType, imageSrc) {
  const skinDetailsContainer = document.getElementById("skin-details");
  const skinVideo = document.getElementById("skin-video");
  const skinImage = document.getElementById("skin-image");

  // Show the container
  skinDetailsContainer.classList.add("visible");

  // Clear previous content
  skinVideo.style.display = "none";
  skinImage.style.display = "none";
  skinVideo.src = "";
  skinImage.src = "";

  const skinNameContainer = document.getElementById("skinNameContainer");
  skinNameContainer.textContent = skin["displayName"];

  // Display the skin image (displayIcon or fullRender)
  skinImage.src = findImageSource(skin, gunType);
  skinImage.style.display = "block";

  // Populate chromas using the generic function
  populateItems(
    "chromaContainer",
    skin["chromas"],
    "chroma",
    skinVideo,
    skinImage
  );

  // Populate levels using the generic function
  populateItems(
    "levelContainer",
    skin["levels"],
    "level",
    skinVideo,
    skinImage
  );
}

function findImageSource(skin, gunType) {
  let imageSrc = "";

  if (isNotEmptyArray(skin["chromas"])) {
    imageSrc =
      skin["chromas"][0]["displayIcon"] || skin["chromas"][0]["fullRender"];
  }

  if (!imageSrc && isNotEmptyArray(skin["levels"])) {
    imageSrc = skin["levels"][0]["displayIcon"];
  }

  const gunTypeName = gunType.toLowerCase() + "_dark";
  imageSrc =
    skin["displayIcon"] || imageSrc || `/static/images/${gunTypeName}.png`;

  if (
    skin["displayName"].startsWith("Standard") &&
    skin["displayName"].split(" ").length == 2
  ) {
    imageSrc = `/static/images/${gunType.toLowerCase()}.png`;
  }

  return imageSrc;
}

function populateItems(containerId, items, itemType, skinVideo, skinImage) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<h3>${
    itemType === "chroma" ? "Chromas" : "Levels"
  }:</h3>`;

  let anyItem = false;
  items?.forEach((item, index) => {
    if (item["streamedVideo"]) {
      const itemDiv = document.createElement("div");
      itemDiv.className = itemType === "chroma" ? "chroma-item" : "level-item";

      if (itemType === "chroma") {
        const swatchImage = document.createElement("img");
        swatchImage.src = item["swatch"] || "/static/images/default_swatch.png";
        swatchImage.alt = item["displayName"];
        swatchImage.className = "chroma-swatch";
        itemDiv.appendChild(swatchImage);
      }

      const itemText = document.createElement("div");
      itemText.className = itemType === "chroma" ? "chroma-text" : "level-text";

      if (itemType === "level") {
        if (item["levelItem"]) {
          let text = item["levelItem"].split("::")[1];
          if (text === "SoundEffects") {
            text = "Sound Effects";
          }
          itemText.textContent = text;
        } else {
          itemText.textContent = "Base";
        }
        itemDiv.innerHTML = "LEVEL " + ++index;
      } else {
        itemText.textContent = item["displayName"];
      }

      itemDiv.appendChild(itemText);

      itemDiv.addEventListener("mouseover", () => {
        itemText.style.display = "block";
        skinVideo.src = item["streamedVideo"];
        skinVideo.style.display = "block";
        skinImage.style.display = "none";
        skinVideo.play();
      });

      itemDiv.addEventListener("mouseout", () => {
        itemText.style.display = "none";
        skinVideo.style.display = "none";
        skinImage.style.display = "block";
        skinVideo.pause();
        skinVideo.currentTime = 0;
      });

      itemDiv.addEventListener("click", () => {
        if (selectedItem) {
          selectedItem.classList.remove("selected");
        }

        itemDiv.classList.add("selected");
        selectedItem = itemDiv;
      });

      container.appendChild(itemDiv);
      anyItem = true;
    }
  });

  if (!anyItem) {
    container.innerHTML = `<h3>${
      itemType === "chroma" ? "Chromas" : "Levels"
    }:</h3><p>No ${
      itemType === "chroma" ? "chromas" : "levels"
    } available.</p>`;
  }
}
