'use strict';

let express = require('express');
let path = require('path');
let port = process.env.PORT || 8080;
let bodyParser = require('body-parser');

let app = express();

app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// API ROUTES
let apiRoutes = require('./api/routes/routes');
apiRoutes(app);

// WEB APP ROUTES
let webRoutes = require('./server/routes/routes');
webRoutes(app);

app.listen(port);

console.log('API server started on: ' + port);
