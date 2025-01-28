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
    // console.log(gunData);
    // for (let gun in gunData) {
    //   console.log(gun);
    // }
    displayGunDetails(gunData);
  } catch (error) {
    console.error("Error fetching gun details:", error);
  }
}

function displayGunDetails(gunData) {
  document.getElementById("gun-title").innerText = gunData.displayName;

  const skinsList = document.getElementById("skins-list");
  skinsList.innerHTML = "";

  for (let uuid in gunData) {
    const skinItem = document.createElement("div");
    skinItem.className = "skin-item";
    skinItem.innerHTML = `
      <img src="${gunData[uuid]["displayIcon"] || "default-icon.png"}" alt="${
      gunData[uuid]["displayName"]
    }" class="skin-icon">
      <p>${gunData[uuid]["displayName"]}</p>
    `;

    // Handle click to update video or image display
    skinItem.addEventListener("click", () => {
      if (gunData[uuid]["streamedVideo"]) {
        updateVideoDisplay(gunData[uuid]["streamedVideo"]);
      } else {
        updateImageDisplay(gunData[uuid]["displayIcon"]);
      }
    });

    skinsList.appendChild(skinItem);
  }
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
