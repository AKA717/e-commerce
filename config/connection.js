const mongoClient = require('mongodb').MongoClient;

const state = {
  db: null
};

module.exports.connect = function (done) {

  const url = 'mongodb://127.0.0.1:27017/';
  const dbName = 'shopping';

  mongoClient.connect(url, (err, client) => {
    console.log("connect is called");
    if(err) {
      console.log(err);
      return done(err);5
    }

    state.db = client.db(dbName);
    console.log(state.db);
    done();
  });
};

module.exports.get = function () {
  if (!state.db) {
    throw new Error('Database not initialized');
  }
  return state.db;
};
