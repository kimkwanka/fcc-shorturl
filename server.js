const express = require('express');
const path = require('path');
const stylus = require('stylus');

const DB = (require('./db.js'));

const app = express();

// Use process.env.PORT if set for Heroku, AWS, etc.
const port = process.env.PORT || 8080;

// Use process.env.MONGOLAB_URI if set for mLab
const mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/shorturl';

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

// Set URI for MongoDB
DB.setURI(mongoURI);

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
  // Try interpreting param as a shortened URL.
  // If it's found in the DB, redirect to the corresponding long URL.
  const param = req.params[0];

  DB.find({
    shorturl: `${req.protocol}://${req.get('host')}/${param}`,
  }, (docs) => {
    if (docs !== null) {
      const redirectUrl = (docs[0].url.indexOf('http') !== -1) ? docs[0].url : `http://${docs[0].url}`;
      res.redirect(redirectUrl);
    } else {
      next();
    }
  });
});

app.get(/\/(.+)/, (req, res) => {
  const param = req.params[0];
  // Try to interpret param as a long URL.
  // If it's a valid URL and not found in the DB, add it.
  // In any case, return corresponding JSON.
  if (isValidURL(param)) {
    DB.find({
      url: param,
    }, (docs) => {
      const ret = {
        shorturl: `${req.protocol}://${req.get('host')}/${generateKey(param)}`,
        url: param,
      };
      if (!docs) {
        res.json(ret);
        DB.save(ret);
      } else {
        res.json(ret);
      }
    });
  } else {
    res.json({
      error: 'Invalid URL',
    });
  }
});

app.get('*', (req, res) => {
  res.render('404', {});
});

const server = app.listen(port);

// Make sure to shutdown server when process ends to free the port
process.on('SIGINT', () => {
  server.close();
});
process.on('SIGTERM', () => {
  server.close();
});
process.on('SIGUSR2', () => {
  server.close();
});

// Export functions for testing in server-test.js
module.exports = {
  isValidURL,
  generateKey,
};
