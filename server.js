'use strict';

      /* =================== Global Variables =================== */

      let weatherObjArr = [];

/* ====================== Server Initialization ======================= */

const express = require('express');
const cors = require('cors');
const { response } = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9999;

/* ============================ Middleware ============================ */

app.use(cors());

/* ============================== Routes ============================== */

// Stretch Goal: Try to get this working later for multiple pages
// app.get('/home', function(req, res){
//   res.send('./index.html');
// });

app.get('/location', (locReq, locRes) => {
  const locData = require('./data/location.json');
  const instanceOfLocData = new locationObject(locData[0], locReq);
  locRes.send(instanceOfLocData);
});

app.get('/weather', (weatherReq, weatherRes) => {
  const weatherData = require('./data/weather.json');
  
  for(let i = 0; i < weatherData.data.length; i++){
    weatherObjArr.push(new weatherObject(weatherData.data[i], weatherData.city_name));
  }
  
  weatherRes.send(weatherObjArr);    
});

/* ======================== Callback Functions ======================== */

app.use('*', (request, response) => {
  response.status(404).send('The route you are looking for is not available.');
});
app.listen(PORT, () => console.log(`server is up on port: ${PORT}`));

      /* ================== Object Constructor ================== */

function locationObject(jsonLocationObj, req){
  this.place_id = jsonLocationObj.place_id;
  this.licence = jsonLocationObj.licence;
  this.osm_type = jsonLocationObj.osm_type;
  this.osm_id = jsonLocationObj.osm_id;
  this.boundingbox = jsonLocationObj.boundingbox;
  this.latitude = jsonLocationObj.lat;
  this.longitude = jsonLocationObj.lon;
  this.formatted_query = jsonLocationObj.display_name;
  this.class = jsonLocationObj.class;
  this.type = jsonLocationObj.type;
  this.importance = jsonLocationObj.importance;
  this.icon = jsonLocationObj.icon;
  this.search_query = 'seattle';
}

function weatherObject(jsonWeatherObj, city){
  this.time = jsonWeatherObj.valid_date;
  this.wind_cdir = jsonWeatherObj.wind_cdir;
  this.forecast = jsonWeatherObj.weather.description;
  this.low_temp = jsonWeatherObj.low_temp;
  this.max_temp = jsonWeatherObj.max_temp;
  this.city_name = city;
}

      /* ===================== Getting Data ===================== */

