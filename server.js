'use strict';


/* ======================= Server Dependencies ======================== */

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const { response } = require('express');
require('dotenv').config();
const superagent = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 9999;

/* ======================== Server Middleware ========================= */

app.use(cors());

/* ============================== Routes ============================== */

app.get('/location', (locReq, locRes) => {
  const sqlLocQuery = 'SELECT * FROM cityapiloc WHERE search_query = $1';
  client.query(sqlLocQuery, [locReq.query.city])
    .then(sqlData => {
      if(sqlData.rows.length > 0){
        locRes.send(sqlData.rows[0]);
        console.log('Location Data Retrieved from SQL Table Successfully');
      }else{
        console.log('entering else of location path')
        const locURL = 'https://us1.locationiq.com/v1/search.php';
        const sqlLocDataAdd = 'INSERT INTO cityapiloc (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *;'
        superagent.get(locURL)
          .query({
            key: process.env.GEOCODE_API_KEY,
            q: locReq.query.city || 'seattle',
            format: 'json'
          })
          .then(res => {
            const instanceOfLocData = new locationObject(res.body[0], locReq.query.city);
            locRes.send(instanceOfLocData);
            console.log('Location Data Retrieved Sucessfully');
            
            client.query(sqlLocDataAdd, [locReq.query.city, instanceOfLocData.formatted_query, instanceOfLocData.latitude, instanceOfLocData.longitude])
              .then(sqlDataResults => sqlDataResults.rows[0])
              .catch(sqlAddErr => console.error(`SQL Data Add Error: ${sqlAddErr}`));
          })
          .catch(locErr => console.error(`Location Error: ${locErr}`));
      }
    })
    .catch(sqlRetrErr => console.error(`SQL Data Retrieve Error: ${sqlRetrErr}`));
});

app.get('/weather', (weatherReq, weatherRes) => {
  const weatherURL = 'https://api.weatherbit.io/v2.0/forecast/daily';
  superagent.get(weatherURL)
    .query({
      key: process.env.WEATHER_API_KEY,
      lat: weatherReq.query.latitude || '47.6038321',
      lon: weatherReq.query.longitude || '-122.3300624',
      days: 8
    })
    .then(res => {
      let weatherObjArr = res.body.data.map(wdArrVal => new weatherObject(wdArrVal));
      weatherRes.send(weatherObjArr);    
      console.log('Weather Data Retrieved Successfully');
    })
    .catch(weatherErr => console.error(`Weather Error: ${weatherErr}`));
});

app.get('/trails', (trailReq, trailRes) => {
  const trailsURL = 'https://www.hikingproject.com/data/get-trails';
  superagent.get(trailsURL)
    .query({
      key: process.env.TRAIL_API_KEY,
      lat: trailReq.query.latitude || '47.6038321',
      lon: trailReq.query.longitude || '-122.3300624',
    })
    .then(res => {
      let trailsObjArr = res.body.trails.map(tdArrVal => new trailsObject(tdArrVal));
      trailRes.send(trailsObjArr);
      console.log('Trails Data Retrieved Successfully');
    })
    .catch(trailsErr => console.error(`Trails Error: ${trailsErr}`));
})

app.get('/movies', (movReq, movRes) => {
  const moviesURL = 'https://api.themoviedb.org/3/search/movie';
  superagent.get(moviesURL)
    .query({
      api_key: process.env.MOVIE_API_KEY,
      query: movReq.query.search_query,
    })
    .then(movResData => {
      let movieObjectArray = movResData.body.results.map(movDataObj => new movieObject(movDataObj));
      while(movieObjectArray.length > 20){
        movieObjectArray.pop();
      }
      movRes.send(movieObjectArray);
    })
    .catch(error => console.error("Error", error));
});

app.get('/yelp', (yelpReq, yelpRes) => {
  let yelpDisplayArr = [];
  const yelpURL = 'https://api.yelp.com/v3/businesses/search';
  superagent.get(yelpURL)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query({
      term: "restaraunts",
      latitude: yelpReq.query.latitude,
      longitude: yelpReq.query.longitude,
      limit: yelpReq.query.page * parseInt(5),
    })
    .then(yelpResData => {
      const yelpResultArr = yelpResData.body.businesses;
      let yelpBusinessArray = yelpResultArr.map(arrVal => new yelpObject(arrVal));
      for(let j = (0 + ((yelpReq.query.page - 1) * 5)); j < yelpBusinessArray.length; j++){
        yelpDisplayArr.push(yelpBusinessArray[j]);
      }
      yelpRes.send(yelpDisplayArr);
      console.log('Yelp Data Retrieved Successfully');
    })
    .catch(error => console.error("Error", error));
});

/* ====================== Server Initialization ======================= */

app.use('*', (request, response) => {
  response.status(404).send('The route you are looking for is not available.');
});

app.use('*', (request, response) => {
  response.status(500).send('Sorry, something went wrong');
});

client.on('error', sqlError => console.error(`PG SQL Error: ${sqlError}`));
client.connect();
app.listen(PORT, () => console.log(`server is up on port: ${PORT}`));

/* ======================== Callback Functions ======================== */



      /* ================== Object Constructor ================== */

function locationObject(jsonLocationObj, loReq = 'seattle'){
  this.latitude = jsonLocationObj.lat;
  this.longitude = jsonLocationObj.lon;
  this.formatted_query = jsonLocationObj.display_name;
  this.search_query = loReq;
}

function weatherObject(jsonWeatherObj){
  this.time = jsonWeatherObj.valid_date;
  this.wind_cdir = jsonWeatherObj.wind_cdir;
  this.forecast = jsonWeatherObj.weather.description;
  this.low_temp = jsonWeatherObj.low_temp;
  this.max_temp = jsonWeatherObj.max_temp;
}

function trailsObject(jsonTrailsObj){
  this.name = jsonTrailsObj.name;
  this.summary = jsonTrailsObj.summary;
  this.difficulty = jsonTrailsObj.difficulty;
  this.stars = jsonTrailsObj.stars;
  this.star_votes = jsonTrailsObj.starVotes;
  this.location = jsonTrailsObj.location;
  this.trail_url = jsonTrailsObj.url;
  this.imgMedium = jsonTrailsObj.imgMedium;
  this.length = jsonTrailsObj.length;
  this.ascent = jsonTrailsObj.ascent;
  this.descent = jsonTrailsObj.descent;
  this.conditionStatus = jsonTrailsObj.conditionStatus || 'Unknown';
  this.conditions = jsonTrailsObj.conditionDetails || 'Unknown';
  this.condition_date = jsonTrailsObj.conditionDate.slice(0,10) || 'Unknown';
  this.condition_time = jsonTrailsObj.conditionDate.slice(11,jsonTrailsObj.conditionDate.length) || 'Unknown';
}

function movieObject(jsonMovieObj){
  this.title = jsonMovieObj.title;
  this.overview = jsonMovieObj.overview;
  this.average_votes = jsonMovieObj.vote_average;
  this.total_votes = jsonMovieObj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${jsonMovieObj.poster_path}`;
  this.popularity = jsonMovieObj.popularity;
  this.released_on = jsonMovieObj.release_date;
}

function yelpObject(jsonYelpObject){
  this.name = jsonYelpObject.name;
  this.image_url = jsonYelpObject.image_url;
  this.price = jsonYelpObject.price || 'N/A';
  this.rating = jsonYelpObject.rating;
  this.url = jsonYelpObject.url;
}