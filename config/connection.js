const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017/';
const dbName = 'shopping';
let state = {
  db: null
};

module.exports.connection = function (callback) {

  console.log("connection called");
  MongoClient.connect(url, function (err, client) {
    console.log("connect is called");
    if (err) {
      console.error('connection Error connecting to the database:', err);
      callback(err);
    } else {
      state.db = client.db(dbName);
      console.log('Database connection established');
      callback(null);
    }
  });
};

module.exports.get = function () {
  if (!state.db) {
    throw new Error('Database not initialized');
  }
  return state.db;
};
