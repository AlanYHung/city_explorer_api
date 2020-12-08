'use strict';

/* ====================== Server Initialization ======================= */

const express = require('express');
const cors = require('cors');
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
  const locData = require('./public/data/location.json');
  const instanceOfLocData = new locationObject(locData[0]);
  locRes.send(`Location: ${instanceOfLocData.display_name}, Latitude: ${instanceOfLocData.lat}, Longitude: ${instanceOfLocData.lon}`);
});


/* ======================== Callback Functions ======================== */

app.use(express.static('./public'));
app.listen(PORT, () => console.log(`server is up on port: ${PORT}`));

      /* =================== Global Variables =================== */

let currentLocation;

      /* ================== Object Constructor ================== */

function locationObject(jsonLocationObj){
  this.place_id = jsonLocationObj.place_id;
  this.licence = jsonLocationObj.licence;
  this.osm_type = jsonLocationObj.osm_type;
  this.osm_id = jsonLocationObj.osm_id;
  this.boundingbox = jsonLocationObj.boundingbox;
  this.lat = jsonLocationObj.lat;
  this.lon = jsonLocationObj.lon;
  this.display_name = jsonLocationObj.display_name;
  this.class = jsonLocationObj.class;
  this.type = jsonLocationObj.type;
  this.importance = jsonLocationObj.importance;
  this.icon = jsonLocationObj.icon;
}

      /* ===================== Getting Data ===================== */

