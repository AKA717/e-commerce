const { MongoClient } = require('mongodb');
const collection = require('./collection');

const url = "mongodb://127.0.0.1:27017/";
const dbName = "shopping";

let state = {
  db: null
};

//connecting the database.
async function connection(callback) {
    try {
      const client = await MongoClient.connect(url);
      state.db = client.db(dbName);
      console.log('Database connection established');
      callback()
    } catch (err) {
      console.error('Connection Error:', err);
      callback(err);
      throw err;
    }
  };

//inserting the data to the function 
async function Insert(collectionName,document)
{
  try
  {
    const db = get();
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(document);
    console.log(result);
    return result;
  }
  catch(err)
  {
    console.log("Error at inserting document : ",err);
    throw err;
  }
}

//returns the database object.
function get() {
  if (!state.db) {
    throw new Error('Database not initialized');
  }
  return state.db;
};

module.exports = {
  connection,
  get,
  Insert
}