require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
let urlDatabase = [];
let urlIdCounter = 1;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
})

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  // Validate the URL format
  const urlPattern = /^(http|https):\/\/([\w.-]+)/;
  const match = originalUrl.match(urlPattern);

  if (!match) {
    return res.json({error: 'invalid url'});
  }

  const hostname = match[2];

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({error: 'invalid url'});
    }

    // save the url in the database
    const shortUrl = urlIdCounter++;
    urlDatabase.push({originalUrl, shortUrl});

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    })
  })  
})

// redirect the original url based on short url
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl);

  const entry = urlDatabase.find((record) => record.shortUrl === shortUrl);
  if (!entry) {
    return res.status(404).json({error: "No short URL found for the given input"});
  }
  res.redirect(entry.originalUrl);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
