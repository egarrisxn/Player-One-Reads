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

//::::::::::: search button event listener ::::::::::::::::
const searchButton = document.querySelector("#search-btn");
searchButton.addEventListener("click", function (e) {
  e.preventDefault();

  clearCardBody();
  const userInput = document.querySelector("#user-search-input").value;
  fetchGameData(userInput);
});

//:::::::::::: creating book category array :::::::::::::::
function buildBooksCategories() {
  booksArray.forEach((book) => {
    const bookCategory = book.volumeInfo.categories[0];
    booksCategories.add(bookCategory);
  });
  // console.log("Books categories:", booksCategories);
  populateDropdown();
}
// console.log(booksArray);
// console.log(booksCategories); //TO BE REMOVED LATER

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
  let gameGenre1;
  let gameGenre2;
  // some games only have 1 genre instead of 2
  if (gameObject.results[0].genres.length === 2) {
    gameGenre1 = gameObject.results[0].genres[0].slug;
    gameGenre2 = gameObject.results[0].genres[1].slug;
    // console.log("2 genres", gameGenre1, gameGenre2);
  } else {
    gameGenre1 = gameObject.results[0].genres[0].slug;
    // console.log("1 genre", gameGenre1);
  }

  // game image link and img element creation
  const gameBackgroundImg = gameObject.results[0].background_image;
  const gameImage = document.createElement("img");
  gameImage.src = gameBackgroundImg;
  gameImage.width = 400;

  gameImageContainer.appendChild(gameImage);

  // call to the function that make the books API call
  // bookApiCall(gameName);
  bookApiCall(gameName, gameGenre1, gameGenre2);
}

//::::::::::: make call to GoogleBooks API ::::::::::::::::
function bookApiCall(title, genre, genre2) {
  console.log("Game title:", title, "    Game genre:", genre);
  const googleBooksApi = `https://www.googleapis.com/books/v1/volumes?key=${googleBooksKey}&orderBy=relevance&projection=full&printType=all&maxResults=40&q=(${genre}, ${genre2}))`;

  // clear previous booksArray content
  booksArray = [];

  fetch(googleBooksApi)
    .then(function (response) {
      const data = response.json();
      return data;
    })
    .then(function (data) {
      // console.log(data);
      // only add books that have a category, image and description
      data.items.forEach((item) => {
        if (
          item.volumeInfo.categories &&
          item.volumeInfo.imageLinks &&
          item.volumeInfo.description
        ) {
          booksArray.push(item);
        }
      });
      // console.log("Books array:", booksArray);
      // clear previous dropdown items
      categoryMenu.innerHTML = "";
      booksCategories = new Set([]);
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
      displayBook(booksArray[i], i);
    }
  } else if (booksArray.length <= booksSuggestionNum) {
    for (let i = 0; i < booksArray.items.length; i++) {
      displayBook(booksArray[i], i);
    }
  }
}

//::::::::::: display book ::::::::::::::::
function displayBook(booksArray, number) {
  // console.log("In display book:", booksArray, "Number: ", number);

  // get book image link, title and description
  const bookImgLink = booksArray.volumeInfo.imageLinks.thumbnail;
  const bookTitle = String(booksArray.volumeInfo.title);
  const bookDescription = String(booksArray.volumeInfo.description);
  const bookInfoLink = String(booksArray.volumeInfo.infoLink);
  // console.log("Book title:", bookTitle);

  // creating div to hold the books suggestions
  const bookDiv = document.createElement("div");
  bookDiv.setAttribute("style", "display: inline-block");
  bookDiv.setAttribute("class", "me-2 col-4");

  // instead of creating elements one by one
  // create a string literal to hold all elements needed
  bookDiv.innerHTML = `
  <img src=${bookImgLink} data-title="${bookTitle}" alt="${booksArray.volumeInfo.title} cover image"></img>
  <p>${booksArray.volumeInfo.title}</p>
  <p>Category: ${booksArray.volumeInfo.categories}</p>
  `;

  // add event listener to book image
  const bookImg = bookDiv.querySelector("img");
  bookImg.addEventListener("click", function () {
    // todo: instead of console log this info goes to the modal
    console.log(`Title: ${bookTitle}`);
    console.log(`Description: ${bookDescription}`);
    console.log(`Info Link: ${bookInfoLink}`);
  });

  // append book inside the book suggestion row
  const cardBody = document.querySelector("#card" + (number + 1));

  // clear previous book image then add the new one
  cardBody.innerHTML = "";
  cardBody.appendChild(bookDiv);
}

//::::::::::: populate dropdown ::::::::::::::::
function populateDropdown() {
  // add the first dropdown element which will be "Select category"
  const selectCategory = document.createElement("option");
  selectCategory.textContent = "Select category";
  categoryMenu.appendChild(selectCategory);

  booksCategories.forEach((category) => {
    // create a category element and add a class and data- attributes
    const div = document.createElement("option");
    div.setAttribute("class", "dropdown-item");
    div.dataset.category = `${category}`;

    // dynamically created elements
    div.innerHTML = `
  <p>${category}</p>
  <hr class="dropdown-divider" />`;

    categoryMenu.appendChild(div);
  });
}

// add event listener to category menu
categoryMenu.addEventListener("change", function () {
  const selectedCategory = this.value;
  const booksWithCategory = [];
  let count = 0;

  // loop through booksArray to find 3 books with the selected category
  for (let i = 0; i < booksArray.length; i++) {
    const categories = booksArray[i].volumeInfo.categories;

    // if the categories key exits and includes the selected category
    // add the book to the booksWithCategory array
    if (categories && categories.includes(selectedCategory)) {
      booksWithCategory.push(booksArray[i]);
      count++;
    }
    // if 3 books have been selected break out of the loop
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
