'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

let app = express();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_HOST);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('db connected!');

  app.set('views', path.join(__dirname, '/server/views'));
  app.set('view engine', 'ejs');

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use(express.static(path.join(__dirname, '/server/public')))

  // API ROUTES
  let apiRoutes = require('./api/routes/routes');
  apiRoutes(app);

  // WEB APP ROUTES
  let webRoutes = require('./server/routes/routes');
  webRoutes(app);

  app.listen(port);

  console.log('API server started on: ' + port);
});
