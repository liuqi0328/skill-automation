'use strict';

let express = require('express');
let app = express();
let port = process.env.PORT || 8080;
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let routes = require('./api/routes/automationRoutes');
routes(app);

app.listen(port);

console.log('API server started on: ' + port);
