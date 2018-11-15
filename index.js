require('dotenv').config();
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const fs = require('fs');
const listenPort = 3000;

require('./lib/routes')(app);

app.set('view engine', 'pug');
app.use('/static', express.static(__dirname + '/public'));

app.listen(listenPort, () => console.log('Listening on port ' + listenPort));
app.use(bodyParser.json({ strict: false }));

module.exports.handler = serverless(app);
