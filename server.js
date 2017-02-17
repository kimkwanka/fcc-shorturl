const express = require('express');
const path = require('path');
const stylus = require('stylus');
const mongo = require('mongodb').MongoClient;

const app = express();

let db;
let col;
// Use process.env.PORT if set for Heroku, AWS, etc.
const port = process.env.PORT || 8080;

const mongoUrl = 'mongodb://localhost:27017/shorturl';

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

// Generate key by hashing the url and converting the result into a base 36 number to shorten it
const generateKey = url => (
  hashCode(url).toString(36)
);

const saveURL = (url) => {
  const urlDoc = {
    key: generateKey(url),
    url,
  };
  col.find({
    key: urlDoc.key
  }).toArray((err1, docs) => {
    if (err1) throw err1;
    if (docs.length === 0) {
      col.insert(urlDoc, (err2) => {
        if (err2) throw err2;
        // URL was added
      });
    } else {
      // URL already in db
    }
  });
};

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
  saveURL('http://www.example.coms');
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

mongo.connect(mongoUrl, (err, _db) => {
  if (err) throw err;
  db = _db;
  col = db.collection('shortenedUrls');
  app.listen(port);
});

process.on('SIGINT', () => {
  db.close();
});

// export functions for testing in server-test.js
module.exports = {
  isValidURL,
  generateKey,
};