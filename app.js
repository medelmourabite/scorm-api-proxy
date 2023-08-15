const express = require('express');
var cors = require('cors');

const { getCompletionStatus, getLaunchLink } = require('./api');
const app = express();
const PORT = 3000;

app.use(cors({ origin: ['https://cloud.scorm.com', 'http://127.0.0.1:3001'] }));
app.use(express.json());

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
