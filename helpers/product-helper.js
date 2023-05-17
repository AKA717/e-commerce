const db = require('../config/connection');

module.exports = {
  addProduct: (product,callback) => {

    db.Insert('products',product).then((result) => {

      callback(result.insertedId.toString());
      
    }).catch((err) => {
      console.log(err);
    })
  }
};
