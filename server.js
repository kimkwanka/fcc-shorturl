const express = require('express');
const path = require('path');
const stylus = require('stylus');

const app = express();

// Use process.env.PORT if set for Heroku, AWS, etc.
const port = process.env.PORT || 8080;

const isValidURL = (url) => (
  url.search(/^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6}|[\d\.]+)([\/:?=&#]{1}[\da-z\.-]+)*[\/\?]?$/) !== -1
);
const shorten = (url) => (
  parseInt(url, 36)
);
const extend = (num) => (
  console.log(num.toString(10))
);

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

app.get('/shorten', (req, res) => {
  res.end();
});

app.get('*', (req, res) => {
  res.render('404', {});
});

app.listen(port);

// export functions for testing in server-test.js
module.exports = {
  isValidURL,
  shorten,
  extend,
};
