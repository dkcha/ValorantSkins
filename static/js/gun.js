// Skin data for weapons
data = {};
// Get the current gun type from the URL
const params = new URLSearchParams(window.location.search);
const gunType = params.get("type");

// Displays guns in horizontal list, track selected skin to highlight for clarity
let selectedSkin = null;

// Track currently selected chroma/level for highlighting purposes
let selectedItem = null;
let selectedChroma = null;
let selectedLevel = null;

// Get the volume slider element
const volumeSlider = document.getElementById("volume-slider");

// Get all video elements on the page
const videos = document.querySelectorAll("video");

// Load the saved volume level from localStorage (default to 1 if not set)
const savedVolume = localStorage.getItem("volumeLevel");
const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 1;
const muteButton = document.getElementById("mute-button");
let isMuted = false;

// Get the search bar and results container
const searchBar = document.getElementById("search-bar");
const searchResults = document.getElementById("search-results");

// Fetch and load gun details from API or local storage
async function fetchGunDetails() {
  if (!gunType) {
    console.error("No gun type specified");
    return;
  }

  // Check local storage first
  const cachedData = localStorage.getItem(gunType);
  if (cachedData) {
    data = JSON.parse(cachedData);
    displayGunDetails(data, gunType);
  } else {
    try {
      const response = await fetch(`/api/gun/skins/${gunType}`);
      const gunData = await response.json();
      localStorage.setItem(gunType, JSON.stringify(gunData)); // Cache the data
      data = gunData;
      displayGunDetails(gunData, gunType);
    } catch (error) {
      console.error("Error fetching gun details:", error);
    }
  }
}

// Finds image source of the skin, usually located in the data[displayIcon] however some skins'
// images are located in nested fields within levels or chromas
function findImageSource(skin, gunType) {
  // Determine the image source
  let imageSrc = "";

  // Check to see if chromas exist and has any image
  if (isNotEmptyArray(skin["chromas"])) {
    imageSrc =
      skin["chromas"][0]["displayIcon"] || skin["chromas"][0]["fullRender"];
  }

  // Check to see if levels exist and has any image
  if (!imageSrc && isNotEmptyArray(skin["levels"])) {
    imageSrc = skin["levels"][0]["displayIcon"];
  }

  const gunTypeName = gunType.toLowerCase() + "_dark";
  imageSrc =
    skin["displayIcon"] || imageSrc || `/static/images/${gunTypeName}.png`;

  // If given skin is the standard, default skin (e.g. Standard Guardian), use asset image
  if (
    skin["displayName"].startsWith("Standard") &&
    skin["displayName"].split(" ").length == 2
  ) {
    imageSrc = `/static/images/${gunType.toLowerCase()}.png`;
  }

  return imageSrc;
}

// Displays skin data (levels and chromas) and videos if it has any
function displayGunDetails(gunData, gunType) {
  const skinContainer = document.getElementById("skin-container");
  skinContainer.innerHTML = "";

  for (let displayName in gunData) {
    // Skin is drilled down version of data[gunType][...]
    const skin = gunData[displayName];

    const skinCard = document.createElement("div");
    skinCard.className = "skin-card";

    // Determine the image source
    let imageSrc = findImageSource(skin, gunType);

    skinCard.innerHTML = `
    <div class="skin-image-container">
      <img src="${imageSrc}" alt="${displayName}" class="skin-image">
      </div>
      <p>${displayName}</p>
    `;

    // Handle skin click
    skinCard.addEventListener("click", () => {
      // Remove selected class from all skins
      document
        .querySelectorAll(".skin-card")
        .forEach((c) => c.classList.remove("selected"));

      // Remove highlight from the previously selected level
      if (selectedSkin) {
        selectedSkin.classList.remove("selected");
        selectedSkin = null;
      }

      // Highlight the selected item
      skinCard.classList.add("selected");
      selectedSkin = skinCard;
      showSkinDetails(skin, gunType, imageSrc);
    });
    skinContainer.appendChild(skinCard);
  }
}

// Populate div items for skin (levels/chromas)
function populateItems(
  containerId,
  items,
  itemType,
  skinVideo,
  skinImage,
  gunType
) {
  const container = document.getElementById(containerId);

  let anyItem = false;
  items?.forEach((item, index) => {
    if (
      (itemType === "level" && item["streamedVideo"]) ||
      (itemType === "chroma" && item["swatch"])
    ) {
      const itemDiv = document.createElement("div");
      itemDiv.className = itemType === "chroma" ? "chroma-item" : "level-item";

      // Create an image element for the swatch (only for chromas)
      if (itemType === "chroma") {
        const swatchImage = document.createElement("img");
        swatchImage.src = item["swatch"] || "/static/images/default_swatch.png";
        swatchImage.alt = item["displayName"];
        swatchImage.className = "chroma-swatch";
        itemDiv.appendChild(swatchImage);
      }

      // Create a text element for the item name
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
        // Create a text element for the level name
        itemDiv.innerHTML = "LEVEL " + ++index;
      } else {
        itemText.textContent = item["displayName"];
      }

      // Append the text to the itemDiv
      itemDiv.appendChild(itemText);

      // Handle hover events
      itemDiv.addEventListener("mouseover", () => {
        itemText.style.display = "block"; // Show text on hover
      });

      itemDiv.addEventListener("mouseout", () => {
        itemText.style.display = "none"; // Hide text on mouseout
        skinVideo.style.display = "none";
        skinImage.style.display = "block";
        skinVideo.pause(); // Pause the video
        skinVideo.currentTime = 0; // Reset the video to the beginning
      });

      // Handle click to highlight the item
      itemDiv.addEventListener("click", () => {
        // Remove highlight from the previously selected item
        if (selectedItem) {
          selectedItem.classList.remove("selected");
        }

        // Highlight the clicked item
        itemDiv.classList.add("selected");
        selectedItem = itemDiv;

        // Display video for given item (level/chroma)
        if (item["streamedVideo"]) {
          skinVideo.src = item["streamedVideo"];
          skinVideo.style.display = "block";
          skinImage.style.display = "none";
          skinVideo.play(); // Start playing the video
        } else {
          // If the item doesn't have a streamed video, display the skin's displayIcon or fullRender
          skinImage.src =
            item["displayIcon"] ||
            item["fullRender"] ||
            `/static/images/${gunType.toLowerCase()}_dark.png`;
          skinImage.style.display = "block";
          skinVideo.style.display = "none";
        }
      });

      container.appendChild(itemDiv);
      anyItem = true;
    }
  });

  if (!anyItem) {
    container.innerHTML = `<p>No ${
      itemType === "chroma" ? "chromas" : "levels"
    } available.</p>`;
  }
}

// Add these helper functions at the top
function clearSkinDetails() {
  // Clear chromas
  const chromaContainer = document.getElementById("chromaContainer");
  chromaContainer.innerHTML = "";

  // Clear levels
  const levelContainer = document.getElementById("levelContainer");
  levelContainer.innerHTML = "";

  // Clear media
  const skinVideo = document.getElementById("skin-video");
  const skinImage = document.getElementById("skin-image");
  skinVideo.style.display = "none";
  skinImage.style.display = "none";
  skinVideo.pause();
  skinVideo.removeAttribute("src");
  skinImage.removeAttribute("src");
}

// Display skin details in window when selected from horizontal list
function showSkinDetails(skin, gunType, imageSrc) {
  clearSkinDetails();
  const skinDetailsContainer = document.getElementById("skin-details");
  //const mediaContainer = document.getElementById("media-container");
  const skinVideo = document.getElementById("skin-video");
  const skinImage = document.getElementById("skin-image");

  // Show the container
  skinDetailsContainer.classList.add("visible");
  skinDetailsContainer.style.display = "grid";

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
    skinImage,
    gunType
  );

  // Populate levels using the generic function
  populateItems(
    "levelContainer",
    skin["levels"],
    "level",
    skinVideo,
    skinImage,
    gunType
  );
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

function isNotEmptyArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

////////////////////////////////////////////////
// Buttons and other miscellaneous functionality
////////////////////////////////////////////////

// Simple home page button functionality
document.getElementById("home-button").addEventListener("click", () => {
  window.location.href = "/";
});

// Refresh data functionality
document.getElementById("refresh-button").addEventListener("click", () => {
  clearLocalStorage();
  fetchGunDetails(); // Refetch the data
});

// Set the initial volume for all videos and the slider
videos.forEach((video) => {
  video.volume = initialVolume;
});
volumeSlider.value = initialVolume * 100;

// Add an event listener to the volume slider
volumeSlider.addEventListener("input", () => {
  // Get the current slider value and divide by 100 as valid range is from [0, 1]
  const volume = volumeSlider.value / 100;

  // Set the volume for all videos
  videos.forEach((video) => {
    video.volume = volume;
  });

  // Save the volume level to localStorage
  localStorage.setItem("volumeLevel", volume);
});

// Mute button functionality
muteButton.addEventListener("click", () => {
  isMuted = !isMuted; // Toggle mute state

  // Mute/unmute all videos
  videos.forEach((video) => {
    video.muted = isMuted;
  });

  // If unmuting, restore the volume level from localStorage
  if (!isMuted) {
    const savedVolume = localStorage.getItem("volumeLevel");
    const volume = savedVolume !== null ? parseFloat(savedVolume) : 1;
    videos.forEach((video) => {
      video.volume = volume;
    });

    volumeSlider.value = volume;
    // Need to multiply volume by 100 again to show up on slider range as it's from [1, 100]
    document.getElementById("volume-slider").value = volume * 100;
  }
});

// Function to filter skins based on the search input
function filterSkins(searchTerm) {
  const results = [];

  // data stores all the skins for the current gun type based on the page
  for (let displayName in data) {
    if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push(displayName);
    }
  }

  return results;
}

// Function to display search results
function displaySearchResults(results) {
  searchResults.innerHTML = ""; // Clear previous results

  if (results.length === 0) {
    searchResults.style.display = "none"; // Hide the results if there are none
    return;
  }

  results.forEach((displayName) => {
    const resultDiv = document.createElement("div");
    resultDiv.textContent = displayName;

    // Handle click on a search result
    resultDiv.addEventListener("click", () => {
      // Find the corresponding skin card in the horizontal list
      const skinCards = document.querySelectorAll(".skin-card");
      skinCards.forEach((skinCard) => {
        if (skinCard.querySelector("p").textContent === displayName) {
          // Remove selected class from all skins
          document
            .querySelectorAll(".skin-card")
            .forEach((c) => c.classList.remove("selected"));

          if (selectedSkin) {
            selectedSkin.classList.remove("selected");
            selectedSkin = null;
          }

          clearSkinDetails();

          // Highlight the selected skin card
          skinCard.classList.add("selected");

          // Scroll the horizontal list to the selected skin card
          skinCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

          // Show the skin details
          const skin = data[displayName];
          // this needs imageSrc, maybe add a field to data[gunType][displayName][imageSrc]?
          const imageSrc = findImageSource(skin, gunType);
          showSkinDetails(skin, gunType, imageSrc);
        } else {
          // Remove highlight from other skin cards
          skinCard.classList.remove("selected");
        }
      });

      // Clear the search bar and hide the results
      searchBar.value = "";
      searchResults.style.display = "none";
    });

    searchResults.appendChild(resultDiv);
  });

  searchResults.style.display = "block"; // Show the results
}

// Add an event listener to the search bar
searchBar.addEventListener("input", () => {
  const searchTerm = searchBar.value.trim();

  if (searchTerm === "") {
    searchResults.style.display = "none"; // Hide the results if the search bar is empty
    return;
  }

  const results = filterSkins(searchTerm); // Filter skins based on the search term
  displaySearchResults(results); // Display the filtered results
});

// Hide the search results when clicking outside the search bar
document.addEventListener("click", (event) => {
  if (
    !searchBar.contains(event.target) &&
    !searchResults.contains(event.target)
  ) {
    searchResults.style.display = "none";
  }
});

// Fetch and load gun skin data
fetchGunDetails();
