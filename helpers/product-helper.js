const db = require('../config/connection');

module.exports = {
  addProduct: function (product, callback) {
    console.log('reached helper', product);

    try {
      db.get().collection('products').insertOne(product, function (err, result) {
        if (err) {
          console.error('Error inserting product:', err);
          callback(err);
        } else {
          console.log(result);
          callback(true);
        }
      });
    } catch (err) {
      callback(err);
    }
  }
};
