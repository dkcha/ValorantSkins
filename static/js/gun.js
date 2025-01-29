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

function displayGunDetails(gunData) {
  const skinContainer = document.getElementById("skin-container");
  skinContainer.innerHTML = "";
  // gunData is the {} of all uuids
  console.log(gunData);
  for (let skin in gunData) {
    const skinCard = document.createElement("div");
    skinCard.className = "skin-card";
    skinCard.innerHTML = `
      <img src="${gunData[skin]["displayIcon"]}" alt="${gunData[skin]["displayName"]}" class="skin-image">
      <p>${gunData[skin]["displayName"]}</p>
    `;

    // Handle skin click
    //console.log("displayGunDetails skin: " + skin);
    console.log("displayGunDetails skin: " + gunData[skin]);
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

  const levelContainer = document.createElement("div");

  // Create hover div for chromas
  // todo: not loading it properly
  skin["chromas"]?.forEach((chroma) => {
    const chromaDiv = document.createElement("div");
    chromaDiv.className = "hover-item";
    chromaDiv.textContent = chroma["displayName"];
    chromaDiv.src = chroma["displayIcon"];
    chromaDiv.addEventListener("mouseover", () => {
      displayStreamedVideo(chroma["streamedVideo"]);
      chromaDiv.addEventListener("mouseout", clearVideo);
    });
    chromaContainer.appendChild(chromaDiv);
  });

  // Create hover div for levels
  // todo: not loading it properly
  skin["levels"]?.forEach((level) => {
    const levelDiv = document.createElement("div");
    levelDiv.className = "hover-item";
    //levelDiv.textContent = level["levelItem"].split("::")[1];
    levelDiv.addEventListener("mouseover", () => {
      displayStreamedVideo(level["streamedVideo"]);
      levelDiv.addEventListener("mouseout", clearVideo);
    });
    levelContainer.appendChild(levelDiv);
  });

  if (chromaContainer.hasChildNodes()) {
    chromaContainer.innerHTML = "<h3>Chromas:</h3>";
    skinDetailsContainer.appendChild(chromaContainer);
  }
  if (levelContainer.hasChildNodes()) {
    levelContainer.innerHTML = "<h3>Levels:</h3>";
    skinDetailsContainer.appendChild(levelContainer);
  }
}

// function displayGunDetails(gunData) {
//   document.getElementById("gun-title").innerText = gunData.displayName;

//   const skinsList = document.getElementById("skins-list");
//   skinsList.innerHTML = "";

//   for (let uuid in gunData) {
//     const skinItem = document.createElement("div");
//     skinItem.className = "skin-item";
//     skinItem.innerHTML = `
//       <img src="${gunData[uuid]["displayIcon"] || "default-icon.png"}" alt="${
//       gunData[uuid]["displayName"]
//     }" class="skin-icon">
//       <p>${gunData[uuid]["displayName"]}</p>
//     `;

//     // Handle click to update video or image display
//     // todo: need to handle levels/chromas for videos
//     skinItem.addEventListener("click", () => {
//       if (gunData[uuid]["streamedVideo"]) {
//         updateVideoDisplay(gunData[uuid]["streamedVideo"]);
//       } else {
//         updateImageDisplay(gunData[uuid]["displayIcon"]);
//       }
//     });

//     skinsList.appendChild(skinItem);
//   }
// }

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

function updateVideoDisplay(videoUrl) {
  const videoElement = document.getElementById("skin-video");
  const videoSource = document.getElementById("video-source");

  videoSource.src = videoUrl;
  videoElement.load();
  videoElement.style.display = "block";

  document.getElementById("default-image").style.display = "none";
}

function updateImageDisplay(imageUrl) {
  const imageElement = document.getElementById("default-image");

  imageElement.src = imageUrl || "default-gun-image.jpg";
  imageElement.style.display = "block";

  document.getElementById("skin-video").style.display = "none";
}

fetchGunDetails();
