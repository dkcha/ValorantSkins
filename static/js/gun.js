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

// todo: some skins like Game Over Sheriff have their displayIcon/fullRender nested inside levels/chromas
function displayGunDetails(gunData, gunType) {
  const skinContainer = document.getElementById("skin-container");
  skinContainer.innerHTML = "";

  for (let skin in gunData) {
    const skinCard = document.createElement("div");
    skinCard.className = "skin-card";

    // Determine the image source (removed "fullRender" to have images smaller)
    const gunTypeName = gunType.toLowerCase() + "_dark";
    const imageSrc =
      gunData[skin]["displayIcon"] || `/static/images/${gunTypeName}.png`;

    skinCard.innerHTML = `
      <img src="${imageSrc}" alt="${gunData[skin]["displayName"]}" class="skin-image">
      <p>${gunData[skin]["displayName"]}</p>
    `;

    // Handle skin click
    skinCard.addEventListener("click", () =>
      showSkinDetails(gunData[skin], gunType)
    );
    skinContainer.appendChild(skinCard);
  }
}

// Track currently selected chroma for highlighting purposes
let selectedChroma = null;

// todo: replace image of gun in skin-details with streamedVideo (if exists otherwise leave alone)
function showSkinDetails(skin, gunType) {
  const skinDetailsContainer = document.getElementById("skin-details");
  const mediaContainer = document.getElementById("media-container");
  const skinVideo = document.getElementById("skin-video");
  const skinImage = document.getElementById("skin-image");

  // Show the container
  skinDetailsContainer.classList.add("visible");

  // Clear previous content
  skinVideo.style.display = "none";
  skinImage.style.display = "none";
  skinVideo.src = "";
  skinImage.src = "";

  // Display the skin image (displayIcon or fullRender)
  skinImage.src =
    skin["displayIcon"] ||
    skin["fullRender"] ||
    `/static/images/${gunType.toLowerCase()}_dark.png`;
  skinImage.style.display = "block";

  // Populate chromas
  const chromaContainer = document.getElementById("chromaContainer");
  chromaContainer.innerHTML = "<h3>Chromas:</h3>";

  let anyChroma = false;
  skin["chromas"]?.forEach((chroma) => {
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
      levelDiv.className = "hover-item";

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

      // Handle hover events
      levelDiv.addEventListener("mouseover", () => {
        skinVideo.src = level["streamedVideo"];
        skinVideo.style.display = "block";
        skinImage.style.display = "none";
        skinVideo.play(); // Start playing the video
      });

      levelDiv.addEventListener("mouseout", () => {
        skinVideo.style.display = "none";
        skinImage.style.display = "block";
        skinVideo.pause(); // Pause the video
        skinVideo.currentTime = 0; // Reset the video to the beginning
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

// Fetch and load gun skin data
fetchGunDetails();
