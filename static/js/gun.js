// Fetch and load gun details from API or local storage
async function fetchGunDetails() {
  const params = new URLSearchParams(window.location.search);
  const gunType = params.get("type");

  if (!gunType) {
    console.error("No gun type specified");
    return;
  }

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

// Displays guns in horizontal list, track selected skin to highlight for clarity
let selectedSkin = null;

function displayGunDetails(gunData, gunType) {
  const skinContainer = document.getElementById("skin-container");
  skinContainer.innerHTML = "";

  for (let skin in gunData) {
    const skinCard = document.createElement("div");
    skinCard.className = "skin-card";

    // Determine the image source
    let imageSrc = "";
    // Check to see if chromas exist and has any image
    if (isNotEmptyArray(gunData[skin]["chromas"])) {
      imageSrc =
        gunData[skin]["chromas"][0]["displayIcon"] ||
        gunData[skin]["chromas"][0]["fullRender"];
    }
    // Check to see if levels exist and has any image
    if (!imageSrc && isNotEmptyArray(gunData[skin]["levels"])) {
      imageSrc = gunData[skins]["levels"][0]["displayIcon"];
    }
    const gunTypeName = gunType.toLowerCase() + "_dark";
    imageSrc =
      gunData[skin]["displayIcon"] ||
      imageSrc ||
      `/static/images/${gunTypeName}.png`;

    // If given skin is the standard, default skin (e.g. Standard Guardian), use asset image
    if (
      gunData[skin]["displayName"].startsWith("Standard") &&
      gunData[skin]["displayName"].split(" ").length == 2
    ) {
      imageSrc = `/static/images/${gunType.toLowerCase()}.png`;
    }

    // <p>${gunData[skin]["displayName"]}</p> (added within skinCard.innerHTML for skin name in list)
    skinCard.innerHTML = `
      <img src="${imageSrc}" alt="${gunData[skin]["displayName"]}" class="skin-image">
    `;

    // Handle skin click
    skinCard.addEventListener("click", () => {
      // Remove highlight from the previously selected level
      if (selectedSkin) {
        selectedSkin.classList.remove("selected");
        selectedSkin = null; // Clear the selected level
      }

      // Highlight the clicked chroma
      skinCard.classList.add("selected");
      selectedSkin = skinCard;
      showSkinDetails(gunData[skin], gunType, imageSrc);
    });
    skinContainer.appendChild(skinCard);
  }
}

// Track currently selected chroma/level for highlighting purposes
let selectedChroma = null;
let selectedLevel = null;

// Display skin details in window when selected from horizontal list
function showSkinDetails(skin, gunType, imageSrc) {
  const skinDetailsContainer = document.getElementById("skin-details");
  //const mediaContainer = document.getElementById("media-container");
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

  //skinDetailsContainer.appendChild(skinNameContainer);

  // Display the skin image (displayIcon or fullRender)
  if (
    skin["displayName"].startsWith("Standard") &&
    skin["displayName"].split(" ").length == 2
  ) {
    skinImage.src = `/static/images/${gunType.toLowerCase()}.png`;
  } else {
    skinImage.src =
      imageSrc ||
      skin["displayIcon"] ||
      skin["fullRender"] ||
      `/static/images/${gunType.toLowerCase()}_dark.png`;
  }
  skinImage.style.display = "block";

  // Populate chromas
  const chromaContainer = document.getElementById("chromaContainer");
  chromaContainer.innerHTML = "<h3>Chromas:</h3>";

  let anyChroma = false;
  skin["chromas"]?.forEach((chroma) => {
    if (chroma["swatch"]) {
      const chromaDiv = document.createElement("div");
      chromaDiv.className = "chroma-item";

      // Create an image element for the swatch
      const swatchImage = document.createElement("img");
      swatchImage.src = chroma["swatch"] || "/static/images/default_swatch.png"; // Fallback image if swatch is missing
      swatchImage.alt = chroma["displayName"];
      swatchImage.className = "chroma-swatch";

      // Create a text element for the chroma name
      const chromaText = document.createElement("div");
      chromaText.textContent = chroma["displayName"];
      chromaText.className = "chroma-text";

      // Append the image and text to the chromaDiv
      chromaDiv.appendChild(swatchImage);
      chromaDiv.appendChild(chromaText);

      // Handle hover events
      chromaDiv.addEventListener("mouseover", () => {
        chromaText.style.display = "block"; // Show text on hover
      });

      chromaDiv.addEventListener("mouseout", () => {
        chromaText.style.display = "none"; // Hide text on mouseout
        skinVideo.style.display = "none";
        skinImage.style.display = "block";
        skinVideo.pause(); // Pause the video
        skinVideo.currentTime = 0; // Reset the video to the beginning
      });

      // Handle click to highlight the chroma
      chromaDiv.addEventListener("click", () => {
        // Remove highlight from the previously selected chroma
        if (selectedChroma) {
          selectedChroma.classList.remove("selected");
        }

        // Remove highlight from the previously selected level
        if (selectedLevel) {
          selectedLevel.classList.remove("selected");
          selectedLevel = null; // Clear the selected level
        }

        // Highlight the clicked chroma
        chromaDiv.classList.add("selected");
        selectedChroma = chromaDiv;

        if (chroma["streamedVideo"]) {
          // If the chroma has a streamed video, display it
          skinVideo.src = chroma["streamedVideo"];
          skinVideo.style.display = "block";
          skinImage.style.display = "none";
          skinVideo.play(); // Start playing the video
        } else {
          // If the chroma doesn't have a streamed video, display the skin's displayIcon or fullRender
          skinImage.src =
            chroma["displayIcon"] ||
            chroma["fullRender"] ||
            `/static/images/${gunType.toLowerCase()}_dark.png`;
          skinImage.style.display = "block";
          skinVideo.style.display = "none";
        }
      });

      chromaContainer.appendChild(chromaDiv);
      anyChroma = true;
    }
  });

  if (!anyChroma) {
    chromaContainer.innerHTML = "<h3>Chromas:</h3><p>No chromas available.</p>";
  }

  // Populate levels
  const levelContainer = document.getElementById("levelContainer");
  levelContainer.innerHTML = "<h3>Levels:</h3>";

  let levelNum = 1;
  let anyLevel = false;
  skin["levels"]?.forEach((level) => {
    if (level["streamedVideo"]) {
      const levelDiv = document.createElement("div");
      levelDiv.className = "level-item";
      let text = "";

      // Grab text from skin data with some edge cases
      if (level["levelItem"]) {
        text = level["levelItem"].split("::")[1];
        if (text == "SoundEffects") {
          text = "Sound Effects";
        }
      } else {
        text = "Base";
      }

      // Create a text element for the level name
      levelDiv.innerHTML = "LEVEL " + levelNum;
      const levelText = document.createElement("div");
      levelText.textContent = text;
      levelText.className = "level-text";

      // Append the text to the levelDiv
      levelDiv.appendChild(levelText);

      // Handle hover events
      levelDiv.addEventListener("mouseover", () => {
        levelText.style.display = "block"; // Show text on hover
      });

      levelDiv.addEventListener("mouseout", () => {
        levelText.style.display = "none";
        skinVideo.style.display = "none";
        skinImage.style.display = "block";
        skinVideo.pause(); // Pause the video
        skinVideo.currentTime = 0; // Reset the video to the beginning
      });

      levelDiv.addEventListener("click", () => {
        // Remove highlight from the previously selected chroma
        if (selectedLevel) {
          selectedLevel.classList.remove("selected");
        }

        // Remove highlight from the previously selected chroma
        if (selectedChroma) {
          selectedChroma.classList.remove("selected");
          selectedChroma = null; // Clear the selected chroma
        }

        // Highlight the clicked chroma
        levelDiv.classList.add("selected");
        selectedLevel = levelDiv;

        skinVideo.src = level["streamedVideo"];
        skinVideo.style.display = "block";
        skinImage.style.display = "none";
        skinVideo.play(); // Start playing the video
      });

      levelContainer.appendChild(levelDiv);
      anyLevel = true;
    }
    levelNum++;
  });

  if (!anyLevel) {
    levelContainer.innerHTML = "<h3>Levels:</h3><p>No levels available.</p>";
  }
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

////////////////////////////////////////////////
// Buttons and other miscellaneous functionality
////////////////////////////////////////////////

// Simple home page button functionality
document.getElementById("home-button").addEventListener("click", () => {
  window.location.href = "/";
});

// Get the volume slider element
const volumeSlider = document.getElementById("volume-slider");

// Get all video elements on the page
const videos = document.querySelectorAll("video");

// Load the saved volume level from localStorage (default to 1 if not set)
const savedVolume = localStorage.getItem("volumeLevel");
const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 1;

// Set the initial volume for all videos and the slider
videos.forEach((video) => {
  video.volume = initialVolume;
});
volumeSlider.value = initialVolume;

// Add an event listener to the volume slider
volumeSlider.addEventListener("input", () => {
  const volume = volumeSlider.value; // Get the current slider value

  // Set the volume for all videos
  videos.forEach((video) => {
    video.volume = volume;
  });

  // Save the volume level to localStorage
  localStorage.setItem("volumeLevel", volume);
});

// Optional: Add a mute button
const muteButton = document.getElementById("mute-button");
let isMuted = false;

muteButton.addEventListener("click", () => {
  isMuted = !isMuted; // Toggle mute state

  // Mute/unmute all videos
  videos.forEach((video) => {
    video.muted = isMuted;
  });

  // Update button text
  muteButton.textContent = isMuted ? "Unmute" : "Mute";

  // If unmuting, restore the volume level from localStorage
  if (!isMuted) {
    const savedVolume = localStorage.getItem("volumeLevel");
    const volume = savedVolume !== null ? parseFloat(savedVolume) : 1;
    videos.forEach((video) => {
      video.volume = volume;
    });
    volumeSlider.value = volume;
  }
});

function isNotEmptyArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

// Fetch and load gun skin data
fetchGunDetails();
