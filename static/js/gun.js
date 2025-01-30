async function fetchGunDetails() {
  const params = new URLSearchParams(window.location.search);
  const gunType = params.get("type");

  if (!gunType) {
    console.error("No gun type specified");
    return;
  }

  try {
    const response = await fetch(`/api/gun/skins/${gunType}`);
    const gunData = await response.json();
    displayGunDetails(gunData);
  } catch (error) {
    console.error("Error fetching gun details:", error);
  }
}

// maybe show the basic gun type image on first click so not throwing null?
function displayGunDetails(gunData) {
  const skinContainer = document.getElementById("skin-container");
  skinContainer.innerHTML = "";

  for (let skin in gunData) {
    const skinCard = document.createElement("div");
    skinCard.className = "skin-card";
    skinCard.innerHTML = `
      <img src="${gunData[skin]["displayIcon"]}" alt="${gunData[skin]["displayName"]}" class="skin-image">
      <p>${gunData[skin]["displayName"]}</p>
    `;

    // Handle skin click
    skinCard.addEventListener("click", () => showSkinDetails(gunData[skin]));
    skinContainer.appendChild(skinCard);
  }
}

// only create button if there's a streamed video that exists for it, and make it hover instead of click
function showSkinDetails(skin) {
  const skinDetailsContainer = document.getElementById("skin-details");
  skinDetailsContainer.innerHTML = `
    <h2>${skin["displayName"]}</h2>
    <img src="${skin["fullRender"] || skin["displayIcon"]}" alt="${
    skin["displayName"]
  }">
  `;

  const chromaContainer = document.createElement("div");
  chromaContainer.id = "chromaContainer";

  const levelContainer = document.createElement("div");
  levelContainer.id = "levelContainer";

  chromaContainer.innerHTML = "<h3>Chromas:</h3>";
  levelContainer.innerHTML = "<h3>Levels:</h3>";

  // Create hover div for chromas
  skin["chromas"]?.forEach((chroma) => {
    if (chroma["streamedVideo"]) {
      const chromaDiv = document.createElement("div");
      chromaDiv.className = "hover-item";
      chromaDiv.textContent = chroma["displayName"];
      chromaDiv.src = chroma["displayIcon"];
      chromaDiv.addEventListener("mouseover", () => {
        displayStreamedVideo(chroma["streamedVideo"]);
        chromaDiv.addEventListener("mouseout", clearVideo);
      });
      chromaContainer.appendChild(chromaDiv);
    } else {
      // Clear all HTML if no streamed videos
      chromaContainer.innerHTML = "";
    }
  });

  // Create hover div for levels
  skin["levels"]?.forEach((level) => {
    if (level["streamedVideo"]) {
      const levelDiv = document.createElement("div");
      levelDiv.className = "hover-item";

      // todo: Should print both Level and its value
      if (level["levelItem"]) {
        let text = level["levelItem"].split("::")[1];
        if (text == "SoundEffects") {
          text = "Sound Effects";
        }
        levelDiv.textContent = text;
      } else {
        levelDiv.textContent = "Base";
      }
      levelDiv.src = level["displayIcon"];
      levelDiv.addEventListener("mouseover", () => {
        displayStreamedVideo(level["streamedVideo"]);
        levelDiv.addEventListener("mouseout", clearVideo);
      });
      levelContainer.appendChild(levelDiv);
    } else {
      // Clear all HTML if no streamed videos
      levelContainer.innerHTML = "";
    }
  });

  skinDetailsContainer.appendChild(chromaContainer);
  skinDetailsContainer.appendChild(levelContainer);
}

// Helper function to display streamed video
function displayStreamedVideo(videoUrl) {
  const videoContainer = document.getElementById("video-container");
  videoContainer.innerHTML = "";

  if (videoUrl) {
    const videoElement = document.createElement("video");
    videoElement.src = videoUrl;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.width = 600;

    videoContainer.appendChild(videoElement);
  } else {
    videoContainer.textContent = "No video available for this selection.";
  }
}

// Helper function to clear the video container
function clearVideo() {
  const videoContainer = document.getElementById("video-container");
  videoContainer.innerHTML = ""; // Clears the video when mouse leaves
}

fetchGunDetails();
