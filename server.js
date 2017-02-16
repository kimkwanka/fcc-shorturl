const express = require('express');
const path = require('path');
const stylus = require('stylus');

const app = express();

// Use process.env.PORT if set for Heroku, AWS, etc.
const port = process.env.PORT || 8080;

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

// Enable Stylus preprocessor as middleware
app.use(stylus.middleware({
  src: path.join(__dirname, '/res'),
  dest: path.join(__dirname, '/public'),
  compile: (str, filepath) => (
    stylus(str)
      .set('filename', filepath)
      .set('compress', true)
    ),
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'URL Shortener',
    url: 'https://XXXXXXXXXXX.com',
  });
});

app.get('/api', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const lang = req.acceptsLanguages()[0];
  const soft = req.headers['user-agent'].match(/\(([^)]+)\)/)[1];

  res.json({
    ipaddress: ip,
    language: lang,
    software: soft,
  });
});

app.get('*', (req, res) => {
  res.render('404', {});
});

app.listen(port);

// export functions for testing in server-test.js
module.exports = {};
