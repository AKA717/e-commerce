const db = require('../config/connection');

module.exports = {
  addProduct: (product,callback) => {

    db.Insert('products',product).then((result) => {

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
