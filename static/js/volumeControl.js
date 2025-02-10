// volumeControl.js
export function setupVolumeControl() {
  const volumeSlider = document.getElementById("volume-slider");
  const muteButton = document.getElementById("mute-button");
  const videos = document.querySelectorAll("video");

  // Load the saved volume level from localStorage (default to 1 if not set)
  const savedVolume = localStorage.getItem("volumeLevel");
  const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 1;
  let isMuted = false;

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

  // Mute button functionality
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
}
