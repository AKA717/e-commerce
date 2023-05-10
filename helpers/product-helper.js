var db = require('../config/connection');

module.exports = {

    addProduct:(product,callback) => {
        console.log("reached helper ",product);

        db.get().collection('product').insertOne(product).then((data)=>{
            callback(true);
        })
    }
}