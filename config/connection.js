const { MongoClient } = require('mongodb');

const url = "mongodb://127.0.0.1:27017/";
const dbName = "shopping";

let state = {
  db: null
};

//connecting the database.
connection = async function (callback) {
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

//Get all products from database.
const GetAll = () => {

  return new Promise( async (resolve,reject) => {

    const db = get();
    let products = await db.collection('products').find().toArray();
    resolve(products);

  })
}

//returns the database object.
get = function () {
  if (!state.db) {
    throw new Error('Database not initialized');
  }
  return state.db;
};

module.exports = {
  connection,
  get,
  Insert,
  GetAll
}