var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var crossOriginMiddleware = require("./middleware/crossOriginMiddleware");

var app = express();

app.set('port', 3007);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(crossOriginMiddleware);

require('./routes/pages')(app);
require('./routes/services')(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});