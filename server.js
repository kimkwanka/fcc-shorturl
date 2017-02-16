const express = require('express');
const path = require('path');
const stylus = require('stylus');

const app = express();

// Use process.env.PORT if set for Heroku, AWS, etc.
const port = process.env.PORT || 8080;

const isValidURL = url => (
  url.search(/^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6}|[\d\.]+)([\/:?=&#]{1}[\da-z\.-]+)*[\/\?]?$/) !== -1 // eslint-disable-line no-useless-escape
);

// hashCode function taken from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
const hashCode = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i += 1) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c; // eslint-disable-line no-bitwise
    hash &= hash; // eslint-disable-line no-bitwise
  }
  return hash;
};

const generateKey = url => (
  hashCode(url).toString(36)
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
  generateKey,
};
