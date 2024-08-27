const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const collection = require("./collection");
dotenv.config();
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/";
const dbName = "shopping";

console.log("URL:", process.env.MONGO_URL);

let state = {
  db: null,
};

//connecting the database.
async function connection(callback) {
  try {
    const client = await MongoClient.connect(url);
    state.db = client.db(dbName);
    console.log("Database connection established");
    callback();
  } catch (err) {
    console.error("Connection Error:", err);
    callback(err);
    throw err;
  }
}

//returns the database object.
function get() {
  if (!state.db) {
    throw new Error("Database not initialized");
  }
  return state.db;
}

module.exports = {
  connection,
  get,
};

