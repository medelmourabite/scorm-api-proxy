const express = require('express');
var cors = require('cors');

const { getCompletionStatus, getLaunchLink } = require('./api');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));

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
