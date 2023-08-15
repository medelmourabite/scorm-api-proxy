const express = require('express');
var cors = require('cors');

const { getCompletionStatus, getLaunchLink } = require('./api');
const app = express();
const PORT = 80;

app.use(express.json());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send('Got a POST request');
});

app.get('/registration/launch-link', getLaunchLink);
app.get('/registration/completion-status', getCompletionStatus);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
