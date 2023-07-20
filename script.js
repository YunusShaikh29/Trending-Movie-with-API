"use strict";

const tmdbApiKey = "ca9852fa24d38f50c5c82df94a7e81a7";
const trendingUrl = "https://api.themoviedb.org/3/trending/movie/day?api_key=";

const geoCodeApiKey = "11373953170839881700x107189";
const geoCoding =
  "https://geocode.xyz/51.50354,-0.12768?geoit=xml&auth=your_api_key";

// const trendingUrl = "https://api.themoviedb.org/3/trending/movie/day?api_key=";

const movieDataCont = document.querySelector(".movie_data_container");
const moviePosterCont = document.querySelector(".movie_poster_container");
const movieOverview = document.querySelector(".movie_overview");
const releaseDate = document.getElementById("release_date");
const leadCast = document.getElementById("lead_cast");
const moreMovies1 = document.getElementById("more_movies--1");
const moreMovies2 = document.getElementById("more_movies--2");

const errorCont = document.querySelector(".error_container");
const errorMsg = document.querySelector(".error_message");

const displayMoviesBtn = document.getElementById("trending_button--display");
const coordinatesBtn = document.getElementById("trending_button--coordinates");

// Additional functionalities related code:

// The scrolling-in animation of the movie-title:
moviePosterCont.addEventListener("mouseenter", (e) => {
  moviePosterCont.classList.remove("animate_out");
  moviePosterCont.classList.add("animate_in");
});

moviePosterCont.addEventListener("mouseleave", (e) => {
  moviePosterCont.classList.remove("animate_in");
  moviePosterCont.classList.add("animate_out");
});

// Truncating to fit: Populate an element with text so as to fit into height (we usually use library for this).
const truncate = function (elt, content, height) {
  function getHeight(elt) {
    return elt.getBoundingClientRect().height;
  }
  function shorten(str) {
    return str.slice(0, -1);
  }

  elt.style.height = "auto";
  elt.textContent = content;

  // Shorten the string until it fits vertically.
  while (getHeight(elt) > height && content) {
    elt.textContent = (content = shorten(content)) + "...";
  }
};

const customFetch = async function (url, errorMessage) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${errorMessage} ${response.status}`);
  return response.json();
};

const displayErrorInUI = function (msg) {
  errorMsg.textContent = msg;
  errorCont.classList.remove("container_hidden");
};

const displayTrendingMovie = async function (url) {
  try {
    const {
      results: [firstTrendingMovie],
    } = await customFetch(
      url,
      `Failed to fetch the trending movie. The error is : `
    );

    moviePosterCont.dataset.title = firstTrendingMovie.title;
    moviePosterCont.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${firstTrendingMovie.poster_path}`;

    truncate(
      movieOverview,
      firstTrendingMovie.overview,
      Math.floor((window.innerHeight * 30) / 100)
    );

    releaseDate.textContent = firstTrendingMovie.release_date;

    const {
      cast: [
        { name: firstCast, id: firstLeadId },
        { name: secondCast, id: seconLeadId },
      ],
    } = await customFetch(
      `https://api.themoviedb.org/3/movie/${firstTrendingMovie.id}/credits?api_key=${tmdbApiKey}`,
      "Could not fetch the cast of the movie"
    );
    console.log(firstLeadId, seconLeadId);
    leadCast.textContent = `${firstCast}, ${secondCast}`;

    const moreMoviesFromCastArr = await Promise.all([
      customFetch(
        `https://api.themoviedb.org/3/person/${firstLeadId}/movie_credits?api_key=${tmdbApiKey}`,
        `Could not fetch more movie from the cast`
      ),
      customFetch(
        `https://api.themoviedb.org/3/person/${seconLeadId}/movie_credits?api_key=${tmdbApiKey}`,
        `Could not fetch more movie from the cast`
      ),
    ]);

    const [
      {
        cast: [{ title: firstLeadMovie }],
      },
      {
        cast: [{ title: secondLeadMovie }],
      }
    ] = moreMoviesFromCastArr;

    moreMovies1.textContent = firstLeadMovie 
    moreMovies2.textContent = secondLeadMovie 

    movieDataCont.classList.remove("container_hidden");

  } catch (error) {
    movieDataCont.classList.add("container_hidden");

    displayErrorInUI(`Error occured :( ${error.message}`)
  }
};

const trendingOnTMDB = _ => displayTrendingMovie(`${trendingUrl}${tmdbApiKey}`)


const displayTrendingMovieByCoord = async function(){
    try{
      errorCont.classList.add('container_hidden')
        const coords = prompt('Enter Co-ordinates')
        coordinatesBtn.blur()
        const response = await customFetch(`https://geocode.xyz/${coords}?geoit=json&auth=${geoCodeApiKey}`, 'There is some issue finding ISO code');
        if(response.error) throw new Error (response.error.description)
        displayTrendingMovie(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_origin_country=${response.prov}`)
    }
    catch (error){
        movieDataCont.classList.add("container_hidden");

        displayErrorInUI(`Error occured :( ${error.message}`)
    }
}


displayMoviesBtn.addEventListener("click", trendingOnTMDB);

coordinatesBtn.addEventListener('click', displayTrendingMovieByCoord)