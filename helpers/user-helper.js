const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;

module.exports = {

    addToCart : (productId,userId) => {

        return new Promise(async (resolve,reject) => {

            console.log("addtocart",userId);
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})

            console.log("usercart",userCart);

            if(userCart)
            {
                db.get().collection(collection.CART_COLLECTION).updateOne({user:new ObjectId(userId)},{
                        $push:{products:new ObjectId(productId)}
                }).then((response) => {
                    resolve();
                })
            }
            else
            {
                let cartObj = {
                    user:new ObjectId(userId),
                    products:[new ObjectId(productId)]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(response => {
                    resolve();
                })
            }
        })
    },

    doSignUp: (userData) => {

        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USERS_COLLECTION, userData).insertOne(userData).then((result) => {

                resolve(result);
            })
        })
    },

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {

            let loginStatus = false;
            let response = {};

            const user = await db.get().collection(collection.USERS_COLLECTION).findOne({email : userData.email});
            
            if(user)
            {
                bcrypt.compare(userData.password,user.password).then(status => {

                    if(status)
                    {
                        console.log("login success");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }
                    else{
                        console.log("login failed");
                        resolve({status:false});
                    }
                })
            }
            else
            {
                console.log("login failed");
                resolve({status:false});
            }
        })
    }
}