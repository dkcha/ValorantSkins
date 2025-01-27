async function fetchAndDisplaySkins() {
  try {
    const response = await fetch("/api/skins");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const container = document.getElementById("guns-container");
    container.innerHTML = ""; // Clear the container

    for (const [category, weapons] of Object.entries(data)) {
      // Create a container for each category
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "category";

      // Add the category name
      const categoryName = document.createElement("h2");
      categoryName.textContent = category.toUpperCase();
      categoryDiv.appendChild(categoryName);

      // Add base weapon image for its category
      const groupImgContainer = document.createElement("div");
      groupImgContainer.className = "category-img-container";

      const groupImg = document.createElement("img");
      groupImg.src = `/static/images/${category.toLowerCase()}.png`; // Map image based on category name
      groupImg.alt = `${category} Image`;
      groupImgContainer.appendChild(groupImg);

      categoryDiv.appendChild(groupImgContainer);

      // Add weapons within the category
      const weaponsContainer = document.createElement("div");
      weaponsContainer.className = "weapons-container";

      // Add expand/collapse icon
      const expandIcon = document.createElement("span");
      expandIcon.textContent = "▼"; // Down arrow
      categoryName.appendChild(expandIcon);

      // Add click event listener to toggle skins display
      categoryDiv.addEventListener("click", () => {
        weaponsContainer.classList.toggle("visible");
        expandIcon.textContent = weaponsContainer.classList.contains("visible")
          ? "▲"
          : "▼";
      });

      // Populate weapons container with weapon cards
      for (const [uuid, weaponDetails] of Object.entries(weapons)) {
        // Create a weapon card
        const weaponDiv = document.createElement("div");
        weaponDiv.className = "weapon";

        // Add weapon image
        const weaponImg = document.createElement("img");
        weaponImg.src = weaponDetails.image_url; // Assumes your backend provides an image URL
        weaponImg.alt = weaponDetails.name;
        weaponDiv.appendChild(weaponImg);

        // Add weapon name
        const weaponName = document.createElement("div");
        weaponName.className = "weapon-name";
        weaponName.textContent = weaponDetails.name;
        weaponDiv.appendChild(weaponName);

        weaponsContainer.appendChild(weaponDiv);
      }

      categoryDiv.appendChild(weaponsContainer);
      container.appendChild(categoryDiv);
    }
  } catch (error) {
    console.error("Error fetching and displaying skins:", error);
  }
}

// Fetch and display skins when the page loads
window.onload = fetchAndDisplaySkins;
