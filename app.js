var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('GitHub Repositories');
});

app.listen(3000, function () {
  console.log('GitHub Repositories app listening on port 3000!');
});