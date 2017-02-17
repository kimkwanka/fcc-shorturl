const express = require('express');
const path = require('path');
const stylus = require('stylus');

const DB = (require('./db.js'));

const app = express();

// Use process.env.PORT if set for Heroku, AWS, etc.
const port = process.env.PORT || 8080;

const mongoURI = 'mongodb://localhost:27017/shorturl';

const isValidURL = url => (
  url.search(/^(https?:\/\/)?(www\.)([\da-z-]+\.)+([\da-z-]{2,})|^(https?:\/\/)?(?!www.)([\da-z-]+\.)+([\da-z-]{2,})([\/:?=&#]{1}[\da-z\.-]+)*[\/\?]?/) !== -1 // eslint-disable-line no-useless-escape
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

// Configure templating engine
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

// Establish MongoDB connection
DB.connect(mongoURI, () => {
  app.listen(port);
});
// Since we're reusing the MongoDB connection throughout the app
// make sure to close it when the server is shut down
process.on('SIGINT', () => {
  DB.close();
});
process.on('SIGTERM', () => {
  DB.close();
});


app.get('/', (req, res) => {
  res.render('index', {
    title: 'URL Shortener',
    url: 'https://XXXXXXXXXXX.com',
  });
});

// Prevent browser's favicon request from triggering our microservice
app.get('/favicon.ico', (req, res) => (
  res.sendStatus(204)
));

// Match every route starting with a forward slash /
app.get(/\/(.+)/, (req, res, next) => {
  console.log('ROUTE 1');
// Try interpreting param as a shortened URL.
// If it's found in the DB, redirect to the corresponding long URL.
  const param = req.params[0];

  DB.find({ shorturl: param }, (docs) => {
    if (docs !== null) {
      console.log('Found Key ', param, docs[0]);
      const redirectUrl = (docs[0].url.indexOf('http') !== -1) ? docs[0].url : `http://${docs[0].url}`;
      res.redirect(redirectUrl);
    } else {
      console.log('Didn\'t find key ', param);
      next();
    }
  });
});
app.get(/\/(.+)/, (req, res) => {
  console.log('ROUTE 2');
  const param = req.params[0];
// Try to interpret param as a long URL.
// If it's a valid URL and not found in the DB, add it.
// In any case, return corresponding JSON.
  if (isValidURL(param)) {
    DB.find({ url: param }, (docs) => {
      const ret = {
        shorturl: generateKey(param),
        url: param,
      };
      if (!docs) {
        console.log('Didn\'t find URL, saving...', param);
        res.json(ret);
        DB.save(ret, () => {
          console.log('Saved.');
        });
      } else {
        console.log('URL already in DB. No need to save.', param);
        res.json(ret);
      }
    });
  } else {
    console.log('Invalid URL', param);
    res.json({
      error: 'Invalid URL',
    });
  }
});

app.get('*', (req, res) => {
  res.render('404', {});
});

// export functions for testing in server-test.js
module.exports = {
  isValidURL,
  generateKey,
};
