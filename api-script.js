"use strict";
//::::::::::::: global variables ::::::::::::::::
const booksSuggestionNum = 3;
let booksData;
let booksArray = [];
let booksCategories = new Set([]);
const categoryMenu = document.querySelector("#category-menu");
//::::::::::::: API Keys ::::::::::::::::
const rawgApiKey = "cc02a6786cd34fc58a69576e666470c0";
const googleBooksKey = "AIzaSyAxqjUh8dmM18Wp0Vs0PdaJ_rMbTt6QUdo";

//::::::::::: Search button event listener ::::::::::::::::
const searchButton = document.querySelector("#search-btn");
searchButton.addEventListener("click", function (e) {
  e.preventDefault();

  clearCardBody();
  const userInput = document.querySelector("#user-search-input").value;
  fetchGameData(userInput);
});

//:::::::::::: Creating book category array :::::::::::::::
function buildBooksCategories() {
  booksArray.forEach((book) => {
    const bookCategory = book.volumeInfo.categories[0];
    booksCategories.add(bookCategory);
  });
  populateDropdown();
}

//::::::::::: Make call to RAWG API ::::::::::::::::
function fetchGameData(gameTitle) {
  const rawgApi = `https://api.rawg.io/api/games?key=${rawgApiKey}&search=${gameTitle}`;

  fetch(rawgApi)
    .then(function (response) {
      const data = response.json();
      // console.log(data);
      return data;
    })
    .then(function (data) {
      extractGameData(data);
    });
}

//::::::::::: 1. Get necessary game field data ::::::::::::::::
//::::::::::: 2. and post game image on website :::::::::::::::
function extractGameData(gameObject) {
  // Container where the game image will be appended
  const gameImageContainer = document.querySelector("#game-img-container");

  // Clear the previous image from the gameImageContainer
  gameImageContainer.innerHTML = "";

  const gameName = gameObject.results[0].name;
  let gameGenre1;
  let gameGenre2;
  // Some games only have 1 genre instead of 2
  if (gameObject.results[0].genres.length === 2) {
    gameGenre1 = gameObject.results[0].genres[0].slug;
    gameGenre2 = gameObject.results[0].genres[1].slug;
  } else {
    gameGenre1 = gameObject.results[0].genres[0].slug;
  }

  // Game image link and img element creation
  const gameBackgroundImg = gameObject.results[0].background_image;
  const gameImage = document.createElement("img");
  gameImage.src = gameBackgroundImg;
  gameImage.width = 400;

  gameImageContainer.appendChild(gameImage);

  // Call to the function that makes the books API call
  bookApiCall(gameName, gameGenre1, gameGenre2);
}

//::::::::::: Make call to GoogleBooks API ::::::::::::::::
function bookApiCall(title, genre, genre2) {
  console.log("Game title:", title, "    Game genre:", genre);
  const googleBooksApi = `https://www.googleapis.com/books/v1/volumes?key=${googleBooksKey}&orderBy=relevance&projection=full&printType=all&maxResults=40&q=(${genre}, ${genre2}))`;

  // Clear previous booksArray content
  booksArray = [];

  fetch(googleBooksApi)
    .then(function (response) {
      const data = response.json();
      return data;
    })
    .then(function (data) {
      // Only add books that have a category, image and description
      data.items.forEach((item) => {
        if (
          item.volumeInfo.categories &&
          item.volumeInfo.imageLinks &&
          item.volumeInfo.description
        ) {
          booksArray.push(item);
        }
      });
      // Clear previous dropdown items
      categoryMenu.innerHTML = "";
      booksCategories = new Set([]);
      shuffleArray(booksArray); // <== might need to remove
      buildBooksCategories();
      bookDisplayLimit();
    });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//::::::::::: Limit book selection ::::::::::::::::
function bookDisplayLimit() {
  if (booksArray.length === 0) {
    alert("No books suggestions for that title");
  } else if (booksArray.length > booksSuggestionNum) {
    for (let i = 0; i < booksSuggestionNum; i++) {
      displayBook(booksArray[i], i);
    }
  } else if (booksArray.length <= booksSuggestionNum) {
    for (let i = 0; i < booksArray.items.length; i++) {
      displayBook(booksArray[i], i);
    }
  }
}

//::::::::::: Display book ::::::::::::::::
function displayBook(booksArray, number) {
  // Get book image link, title and description
  const bookImgLink = booksArray.volumeInfo.imageLinks.thumbnail;
  const bookTitle = String(booksArray.volumeInfo.title);
  const bookDescription = String(booksArray.volumeInfo.description);
  const bookInfoLink = String(booksArray.volumeInfo.infoLink);

  // Creating div to hold the books suggestions
  const bookDiv = document.createElement("div");
  bookDiv.setAttribute("style", "display: inline-block");
  bookDiv.setAttribute("class", "me-2 col-4");

  // Instead of creating elements one by one,
  // create a string literal to hold all elements needed
  bookDiv.innerHTML = `
  <img src=${bookImgLink} data-title="${bookTitle}" alt="${booksArray.volumeInfo.title} cover image" class="js-modal-trigger" data-target="modal-js"></img>
  <p>${booksArray.volumeInfo.title}</p>
  <p>Category: ${booksArray.volumeInfo.categories}</p>
  `;

  // Add event listener to book image
  const bookImg = bookDiv.querySelector("img");

  bookImg.addEventListener("click", function () {
    // When a book image is clicked, the class is-active will be
    // added to the modal which will launch the modal
    const modal = document.querySelector("#modal-js");
    modal.classList.add("is-active");

    // HTML tags to add content to the model. The modal will
    // display the book title, description and google link
    const modalContent = `
    <h2 class="title">${bookTitle}</h2>
    <p>${bookDescription}</p>
    <br>
    <a href=${bookInfoLink} target="_blank">${bookInfoLink}</a>
    `;

    // Add the content to the modal card
    const modalCardItems = document.querySelector("#modal-card-items");
    modalCardItems.innerHTML = modalContent;
  });

  // Append book inside the book suggestion row
  const cardBody = document.querySelector("#card" + (number + 1));

  // Clear previous book image then add the new one
  cardBody.innerHTML = "";
  cardBody.appendChild(bookDiv);
}

//::::::::::: Populate dropdown ::::::::::::::::
function populateDropdown() {
  // Add the first dropdown element which will be "Select category"
  const selectCategory = document.createElement("option");
  selectCategory.textContent = "Select category";
  categoryMenu.appendChild(selectCategory);

  booksCategories.forEach((category) => {
    // Create a category element and add a class and data- attributes
    const div = document.createElement("option");
    div.setAttribute("class", "dropdown-item");
    div.dataset.category = `${category}`;

    // Dynamically created elements
    div.innerHTML = `
  <p>${category}</p>
  <hr class="dropdown-divider" />`;

    categoryMenu.appendChild(div);
  });
}

// Add event listener to category menu
categoryMenu.addEventListener("change", function () {
  const selectedCategory = this.value;
  const booksWithCategory = [];
  let count = 0;

  // Loop through booksArray to find 3 books with the selected category
  for (let i = 0; i < booksArray.length; i++) {
    const categories = booksArray[i].volumeInfo.categories;

    // If the categories key exits and includes the selected category,
    // add the book to the booksWithCategory array
    if (categories && categories.includes(selectedCategory)) {
      booksWithCategory.push(booksArray[i]);
      count++;
    }
    // If 3 books have been selected break out of the loop
    if (count === 3) {
      break;
    }
  }

  clearCardBody();
  for (let i = 0; i < booksWithCategory.length; i++) {
    displayBook(booksWithCategory[i], i);
  }
});

// clear all cards when a new category is selected so the images
// don't display next to each other
function clearCardBody() {
  for (let i = 1; i < 4; i++) {
    const cardBody = document.querySelector("#card" + i);
    cardBody.innerHTML = "";
  }
}

// :::::::::::::::::::: BULMA JS MODAL CODE ::::::::::::::::::::::::::
document.addEventListener("DOMContentLoaded", () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add("is-active");
  }

  function closeModal($el) {
    $el.classList.remove("is-active");
  }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll(".js-modal-trigger") || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (
    document.querySelectorAll(
      ".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button"
    ) || []
  ).forEach(($close) => {
    const $target = $close.closest(".modal");

    $close.addEventListener("click", () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener("keydown", (event) => {
    const e = event || window.event;

    if (e.key === "Escape") {
      // Escape key
      closeAllModals();
    }
  });
});
