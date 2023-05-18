const db = require('../config/connection');
const collection = require('../config/collection');


module.exports = {
  addProduct: (product,callback) => {

    db.Insert(collection.PRODUCT_COLLECTION,product).then((result) => {

      console.log(result);

      callback(result.insertedId.toString());

    }).catch((err) => {
      console.log(err);
    })
  },

  getAllProducts: async () => {
    let products = await db.GetAll();
    return products;
  }
};
