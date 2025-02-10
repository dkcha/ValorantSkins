// searchBar.js
export function setupSearchBar(data, gunType) {
  const searchBar = document.getElementById("search-bar");
  const searchResults = document.getElementById("search-results");

  // Function to filter skins based on the search input
  function filterSkins(searchTerm) {
    const results = [];

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
            // Highlight the selected skin card
            skinCard.classList.add("selected");

            // Scroll the horizontal list to the selected skin card
            skinCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

            // Show the skin details
            const skin = data[displayName];
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
}
