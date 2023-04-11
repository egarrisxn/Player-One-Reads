"use strict";

const rawgApiKey = "cc02a6786cd34fc58a69576e666470c0";
const googleBooksKey = "AIzaSyAxqjUh8dmM18Wp0Vs0PdaJ_rMbTt6QUdo";

//::::::::::: search button event listener ::::::::::::::::
const searchButton = document.querySelector(".search-btn");
searchButton.addEventListener("click", function (e) {
  e.preventDefault();
  const userInput = document.querySelector(".user-search-input").value;
  fetchGameData(userInput);
});

//::::::::::: make call to RAWG API ::::::::::::::::
function fetchGameData(gameTitle) {
  const rawgApi =
    "https://api.rawg.io/api/games?key=" + rawgApiKey + "&search=" + gameTitle;

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
  const gameImageContainer = document.querySelector(".game-img-container");
  gameImageContainer.innerHTML = "";
  console.log(gameObject.results[0]);
  const gameName = gameObject.results[0].name;

  if (gameObject.results[0].genres.length === 2) {
    const gameGenre1 = gameObject.results[0].genres[0].slug;
    const gameGenre2 = gameObject.results[0].genres[1].slug;
  } else {
    const gameGenre1 = gameObject.results[0].genres[0].slug;
  }
  const gameBackgroundImg = gameObject.results[0].background_image;

  const gameImage = document.createElement("img");
  gameImage.src = gameBackgroundImg;
  gameImage.width = 400;

  gameImageContainer.appendChild(gameImage);
  bookApiCall(gameName);
}

//::::::::::: make call to GoogleBooks API ::::::::::::::::
function bookApiCall(title) {
  console.log("Game title:", title);
  const googleBooksApi = `https://www.googleapis.com/books/v1/volumes?key=${googleBooksKey}&orderBy=relevance&projection=full&q=${title}`;
  fetch(googleBooksApi)
    .then(function (response) {
      const data = response.json();
      return data;
    })
    .then(function (data) {
      console.log(data);
      booksToFilter(data);
    });
}

//::::::::::: select books to filter ::::::::::::::::
function booksToFilter(booksArr) {
  if (booksArr.totalItems === 0) {
    alert("No books suggestions for that title");
  } else if (booksArr.totalItems > 3) {
    for (let i = 0; i < 3; i++) {
      booksToDisplay(booksArr, i);
    }
  } else if (booksArr.totalItems <= 3) {
    for (let i = 0; i < booksArr.items.length; i++) {
      booksToDisplay(booksArr, i);
    }
  }
}

//::::::::::: select books to display ::::::::::::::::
function booksToDisplay(array, number) {
  const bookImgLink = array.items[number].volumeInfo.imageLinks.thumbnail;
  const bookImage = document.createElement("img");
  bookImage.src = bookImgLink;
  // bookImage.width = 400;

  const cardBody = document.querySelector(".card-body" + number);
  cardBody.appendChild(bookImage);
}
