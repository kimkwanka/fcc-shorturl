const express = require('express');
const path = require('path');
const stylus = require('stylus');
const mongo = require('mongodb').MongoClient;

const app = express();

let db;

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

const saveURL = (url, cb) => {
  console.log('Save what?', url);
  const urlDoc = {
    key: generateKey(url),
    url,
  };
  const col = db.collection('shortenedUrls');
  col.find({
    key: urlDoc.key,
  }).toArray((err1, docs) => {
    if (err1) throw err1;
    if (docs.length === 0) {
      col.insert(urlDoc, (err2) => {
        if (err2) throw err2;
        // URL was added
        console.log('Added:', urlDoc);
        cb(urlDoc);
      });
    } else {
      console.log('Already there:', urlDoc);
      cb(urlDoc);
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
  console.log('ROOT');
  res.render('index', {
    title: 'URL Shortener',
    url: 'https://XXXXXXXXXXX.com',
  });
});

// Prevent browser's favicon request from triggering our microservice
app.get('/favicon.ico', (req, res) => (
  res.sendStatus(204)
));

app.get(/^\/(https?:\/\/)?(www\.)([\da-z-]+\.)+([\da-z-]{2,})|^\/(https?:\/\/)?(?!www.)([\da-z-]+\.)+([\da-z-]{2,})([\/:?=&#]{1}[\da-z\.-]+)*[\/\?]?/, (req, res) => { 
//app.get(/^\/(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,3}|[\d\.]+)([\/:?=&#]{1}[\da-z\.-]+)*[\/\?]?$/, (req, res) => {
  console.log('Matched');
  let ret = {
    error: 'Invalid URL',
  };
  console.log( req.params);
  let tmp = '';
  // 8 capture groups in regex
  for(let i=0; i<8 ;i++){ 
    if(req.params[i]){
      tmp += req.params[i];
    }
  }
  req.param
  const urlStr = tmp;
  const col = db.collection('shortenedUrls');

  col.find({
    key: urlStr,
  }).toArray((err1, docs) => {
    if (err1) throw err1;
    if (docs.length !== 0) {
      res.redirect(docs[0].url);
      //res.json({ redirect: docs[0].url });
    } else {
      if (true) {
        // console.log('Not a key, but valid URL');
        saveURL(urlStr, (r) => {
          ret = {
            url: r.url,
            shortUrl: req.protocol + '://' + req.get('host') + '/' + r.key,
          };
          // console.log('ret', ret);
          res.json(ret);
        });
      } else {
        res.json(ret);
      }
    }
  });
});

app.get('/:urlStr', (req, res) => {
  console.log('Simple Match', req.params.urlStr);
  const col = db.collection('shortenedUrls');

  col.find({
    key: req.params.urlStr,
  }).toArray((err1, docs) => {
    console.log('have I found it?');
    if (err1) throw err1;
    if (docs.length !== 0) {
      let addition = '';
      if(docs[0].url.indexOf('http') === -1){
        addition = 'http://';
      }
      console.log('Simple redirect',err1, addition + docs[0].url)
      res.redirect(addition + docs[0].url);
      console.log('before crash');
    } else {
      console.log('before crash');
      let ret = {
        error: 'Invalid URL :O',
      };
      res.json(ret);
    }
  });
  
});

app.get('*', (req, res) => {
  
  console.log('Should I ever land here?');
  //let ret = {
  //  error: 'Invalid URL',
  //};
  //res.json(ret);
  //res.render('404', {});
  res.render('404', {});
});

mongo.connect(mongoUrl, (err, _db) => {
  if (err) throw err;
  db = _db;
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
