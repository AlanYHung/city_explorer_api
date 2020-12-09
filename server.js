'use strict';


/* ====================== Server Initialization ======================= */

const express = require('express');
const cors = require('cors');
const { response } = require('express');
require('dotenv').config();
const superagent = require('superagent')

const app = express();
const PORT = process.env.PORT || 9999;

/* ============================ Middleware ============================ */

app.use(cors());

/* ============================== Routes ============================== */

app.get('/location', (locReq, locRes) => {
  const locURL = 'https://us1.locationiq.com/v1/search.php';
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
    })
    .catch(() =>
      console.log('Location Error')
    )
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
    .catch(() => {
      console.log('Weather Error')
    })
});

app.get('/trails', (trailReq, trailRes) => {
  const trailsURL = 'https://www.hikingproject.com/data/get-trails'
  superagent.get(trailsURL)
    .query({
      key: process.env.TRAIL_API_KEY,
      lat: trailReq.query.latitude || '47.6038321',
      lon: trailReq.query.longitude || '-122.3300624',
    })
    .then(res => {
      let trailsObjArr = res.body.trails.map((tdArrVal,index) => {
        if(index < 10){
          return new trailsObject(tdArrVal);
        }
      });
      trailRes.send(trailsObjArr);
      console.log('Trails Data Retrieved Successfully');
    })
    .catch(() => {
      console.log('Trails Error')
    });
})

/* ======================== Callback Functions ======================== */

app.use('*', (request, response) => {
  response.status(404).send('The route you are looking for is not available.');
  response.status(500).send('Sorry, something went wrong');
});
app.listen(PORT, () => console.log(`server is up on port: ${PORT}`));

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
