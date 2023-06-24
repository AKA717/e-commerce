const db = require('../config/connection');
const collection = require('../config/collection');
const { response } = require('../app');
const ObjectId = require('mongodb').ObjectId;

module.exports = {

  updateProduct : (productId,productDetails) => {

    return new Promise((resolve,reject) => {

      db.get().collection(collection.PRODUCT_COLLECTION)
      .updateOne({_id:new ObjectId(productId)},{
        $set:{
          title:productDetails.title,
          category:productDetails.category,
          description:productDetails.description,
          price:parseInt(productDetails.price)
        }
      }).then( response => {
        resolve();
      })
    })
  },

  getProductInfo : (productId) => {

    return new Promise((resolve,reject) => {

      db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(productId)}).then(product => {
        resolve(product);
      })
    })
  },

  deleteProduct : (productId) => {
    return new Promise((resolve,reject) => {

      db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new ObjectId(productId)}).then(response => {

        resolve(response);
      })

    })
  },

  addProduct : (product,callback) => {

    product.price = parseInt(product.price);

    db.get().collection(collection.PRODUCT_COLLECTION).insetOne(product).then((result) => {

      callback(result.insertedId.toString());

    }).catch((err) => {
      console.log(err);
    })
  },

  getAllProducts : async () => {

    return new Promise( async (resolve,reject) => {

      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();

      resolve(products);
  
    })
  }
};
