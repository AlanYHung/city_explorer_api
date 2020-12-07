'use strict';

/* ====================== Server Initialization ======================= */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ============================ Middleware ============================ */

app.use(cors());

/* ============================== Routes ============================== */

app.get('/serverstarted', function(req, res){
  console.log('Server Started Alan');
  res.send('Server Started');
});

/* ======================== Callback Functions ======================== */

app.listen(PORT, () => console.log(`server is up on port: ${PORT}`));