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

res.send('Server Started');

/* ======================== Callback Functions ======================== */
