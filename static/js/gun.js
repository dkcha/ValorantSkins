async function fetchGunDetails() {
  const params = new URLSearchParams(window.location.search);
  const gunType = params.get("type");

  if (!gunType) {
    console.error("No gun type specified");
    return;
  }

  // try {
  //   const response = await fetch(`/api/gun/skins/${gunType}`);
  //   const gunData = await response.json();
  //   displayGunDetails(gunData);
  // } catch (error) {
  //   console.error("Error fetching gun details:", error);
  // }

  // Check local storage first
  const cachedData = localStorage.getItem(gunType);
  if (cachedData) {
    displayGunDetails(JSON.parse(cachedData), gunType);
  } else {
    try {
      const response = await fetch(`/api/gun/skins/${gunType}`);
      const gunData = await response.json();
      localStorage.setItem(gunType, JSON.stringify(gunData)); // Cache the data
      displayGunDetails(gunData, gunType);
    } catch (error) {
      console.error("Error fetching gun details:", error);
    }
  }
}

// maybe show the basic gun type image on first click so not throwing null?
function displayGunDetails(gunData, gunType) {
  const skinContainer = document.getElementById("skin-container");
  skinContainer.innerHTML = "";

  for (let skin in gunData) {
    const skinCard = document.createElement("div");
    skinCard.className = "skin-card";

    // Determine the image source
    const gunTypeName = gunType.toLowerCase() + "_dark";
    const imageSrc =
      gunData[skin]["fullRender"] ||
      gunData[skin]["displayIcon"] ||
      `/static/images/${gunTypeName}.png`;

    skinCard.innerHTML = `
      <img src="${imageSrc}" alt="${gunData[skin]["displayName"]}" class="skin-image">
      <p>${gunData[skin]["displayName"]}</p>
    `;

    // Handle skin click
    skinCard.addEventListener("click", () => showSkinDetails(gunData[skin]));
    skinContainer.appendChild(skinCard);
  }
}

// only create button if there's a streamed video that exists for it, and make it hover instead of click
function showSkinDetails(skin) {
  clearVideo();
  const skinDetailsContainer = document.getElementById("skin-details");
  // If the given skin does not have a fullRender or displayIcon, need to use placeholder
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
  let anyChroma = false;
  skin["chromas"]?.forEach((chroma) => {
    if (chroma["streamedVideo"]) {
      const chromaDiv = document.createElement("div");
      chromaDiv.className = "hover-item";
      chromaDiv.textContent = chroma["displayName"];
      chromaDiv.src = chroma["displayIcon"];
      chromaDiv.addEventListener("mouseover", () => {
        displayStreamedVideo(chroma["streamedVideo"]);
        //chromaDiv.addEventListener("mouseout", clearVideo);
      });
      chromaContainer.appendChild(chromaDiv);
      anyChroma = true;
    }
  });

  if (!anyChroma) {
    // Clear all HTML if no streamed videos
    console.log("Clearing all innerHtml Chroma why");
    chromaContainer.innerHTML = "";
  }

  // Create hover div for levels
  let levelNum = 1;
  let anyLevel = false;
  skin["levels"]?.forEach((level) => {
    if (level["streamedVideo"]) {
      const levelDiv = document.createElement("div");
      levelDiv.className = "hover-item";

      // todo: Level should be white and bold?
      if (level["levelItem"]) {
        let text = level["levelItem"].split("::")[1];
        if (text == "SoundEffects") {
          text = "Sound Effects";
        }
        levelDiv.innerHTML = "Level " + levelNum + "<br>" + text;
      } else {
        levelDiv.innerHTML = "Level " + levelNum + "<br>Base";
      }
      levelDiv.src = level["displayIcon"];
      levelDiv.addEventListener("mouseover", () => {
        displayStreamedVideo(level["streamedVideo"]);
        //levelDiv.addEventListener("mouseout", clearVideo);
      });
      levelContainer.appendChild(levelDiv);
      anyLevel = true;
    }
    levelNum++;
  });

  if (!anyLevel) {
    // Clear all HTML if no streamed videos
    levelContainer.innerHTML = "";
  }

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

function clearLocalStorage() {
  localStorage.clear();
}

document.getElementById("refresh-button").addEventListener("click", () => {
  clearLocalStorage();
  fetchGunDetails(); // Refetch the data
});

// Simple home page button functionality
document.getElementById("home-button").addEventListener("click", () => {
  window.location.href = "/";
});

fetchGunDetails();
