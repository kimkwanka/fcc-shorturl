const mongo = require('mongodb').MongoClient;

let db = null;

const close = () => (
  db.close()
);

const connect = (uri, cb) => {
  mongo.connect(uri, (err, _db) => {
    if (err) throw err;
    db = _db;
    cb(db);
  });
};

const find = (query, cb) => {
  db.collection('shortenedUrls').find(query)
  .toArray((err, docs) => {
    if (err) throw err;
    return (docs.length > 0) ? cb(docs) : cb(null);
  });
};

const save = (obj, cb) => {
  db.collection('shortenedUrls').insert(obj, (err) => {
    if (err) throw err;
    console.log('Added:', obj);
    cb(obj);
  });
};

module.exports = {
  connect,
  find,
  close,
  save,
};
