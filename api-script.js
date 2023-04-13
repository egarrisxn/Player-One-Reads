"use strict";
//::::::::::::: global variables ::::::::::::::::
const booksSuggestionNum = 3;
let booksData;
let booksArray = [];
let booksCategories = new Set([]);

//::::::::::::: API Keys ::::::::::::::::
const rawgApiKey = "cc02a6786cd34fc58a69576e666470c0";
const googleBooksKey = "AIzaSyAxqjUh8dmM18Wp0Vs0PdaJ_rMbTt6QUdo";

//!::::::ADDED CLICK FOR LANDING PAGE::::::::::
function goToPage() {
  window.location.href = "./recs-page.html";
}

//::::::::::: search button event listener ::::::::::::::::
const searchButton = document.querySelector("#search-btn");
searchButton.addEventListener("click", function (e) {
  e.preventDefault();
  const userInput = document.querySelector("#user-search-input").value;
  fetchGameData(userInput);
});

//:::::::::::: creating book category array :::::::::::::::
function buildBooksCategories() {
  booksArray.forEach((book) => {
    const bookCategory = book.volumeInfo.categories[0];
    booksCategories.add(bookCategory);
  });
  populateDropdown();
}
console.log(booksArray);
console.log(booksCategories); //TO BE REMOVED LATER

//::::::::::: make call to RAWG API ::::::::::::::::
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

//::::::::::: 1. get necessary game field data ::::::::::::::::
//::::::::::: 2. and post game image on website :::::::::::::::
function extractGameData(gameObject) {
  // container where the game image will be appended
  const gameImageContainer = document.querySelector("#game-img-container");

  // clear the previous image from the gameImageContainer
  gameImageContainer.innerHTML = "";
  // console.log(gameObject.results[0]);

  const gameName = gameObject.results[0].name;

  // some games only have 1 genre instead of 2
  if (gameObject.results[0].genres.length === 2) {
    const gameGenre1 = gameObject.results[0].genres[0].slug;
    const gameGenre2 = gameObject.results[0].genres[1].slug;
  } else {
    const gameGenre1 = gameObject.results[0].genres[0].slug;
  }

  // game image link and img element creation
  const gameBackgroundImg = gameObject.results[0].background_image;
  const gameImage = document.createElement("img");
  gameImage.src = gameBackgroundImg;
  gameImage.width = 400;

  gameImageContainer.appendChild(gameImage);

  // call to the function that make the books API call
  bookApiCall(gameName);
}

//::::::::::: make call to GoogleBooks API ::::::::::::::::
function bookApiCall(title) {
  console.log("Game title:", title);
  const googleBooksApi = `https://www.googleapis.com/books/v1/volumes?key=${googleBooksKey}&orderBy=relevance&projection=full&maxResults=40&q=${title}`;
  fetch(googleBooksApi)
    .then(function (response) {
      const data = response.json();
      return data;
    })
    .then(function (data) {
      // console.log(data);
      // only add books that have a category association
      data.items.forEach((item) => {
        if (item.volumeInfo.categories && item.volumeInfo.imageLinks) {
          booksArray.push(item);
        }
      });
      buildBooksCategories();
      bookDisplayLimit();
    });
}

//::::::::::: limit book selection ::::::::::::::::
function bookDisplayLimit() {
  if (booksArray.length === 0) {
    alert("No books suggestions for that title");
  } else if (booksArray.length > booksSuggestionNum) {
    for (let i = 0; i < booksSuggestionNum; i++) {
      displayBook(i);
    }
  } else if (booksArray.length <= booksSuggestionNum) {
    for (let i = 0; i < booksArray.items.length; i++) {
      displayBook(i);
    }
  }
}

//::::::::::: display book ::::::::::::::::
function displayBook(number) {
  // get book image link
  const bookImgLink = booksArray[number].volumeInfo.imageLinks.thumbnail;

  // creating div to hold the books suggestions
  const bookDiv = document.createElement("div");
  bookDiv.setAttribute("style", "display: inline-block");
  bookDiv.setAttribute("class", "me-2 col-4");

  // instead of creating elements one by one
  // create a string literal to hold all elements needed
  // ! eliminate the string literal and use the HTML cards instead !!!
  bookDiv.innerHTML = `
  <img src=${bookImgLink}></img>
  <p>${booksArray[number].volumeInfo.title}</p>
  <p>Category: ${booksArray[number].volumeInfo.categories}</p>
  `;

  // append book inside the book suggestion row
  const cardBody = document.querySelector("#book-suggestion-row");
  cardBody.appendChild(bookDiv);
  // buildBooksCategories(); //! to delete
}

//::::::::::: populate dropdown ::::::::::::::::
function populateDropdown() {
  const categoryMenu = document.querySelector("#category-menu");
  booksCategories.forEach((category) => {
    // select categories container
    const div = document.createElement("div");
    div.setAttribute("class", "dropdown-item");
    div.dataset.category = `${category}`;

    // dynamically created elements
    div.innerHTML = `
  <p>${category}</p>
  <hr class="dropdown-divider" />`;

    categoryMenu.appendChild(div);
  });
}
