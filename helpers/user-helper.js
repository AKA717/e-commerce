const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;

module.exports = {

    changeProductQuantity : ({cart,product,count}) => {

        console.log(cart,product,count);

        return new Promise((resolve,reject) => {

            db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                            _id:new ObjectId(cart),
                            'products.item':new ObjectId(product)
                        },
                        {
                            $inc:{'products.$.quantity': parseInt(count)}
                        }).then(response => {
                            console.log("qauntity",response);
                            resolve();
                        })
        })
    },

    getCartCount : (userId) => {

        return new Promise(async (resolve,reject) => {

            let count = 0;

            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})

            if(cart)
            {
                count = cart.products.length;
            }
            
            resolve(count)
            
        })
    },

    getCartProducts : (userId) => {

        return new Promise(async (resolve,reject) => {

            const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match:{user:new ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()

            console.log(cartItems);
            resolve(cartItems);
        })
    },

    addToCart : (productId,userId) => {

        const productObj = {
            item:new ObjectId(productId),
            quantity:1
        };

        return new Promise(async (resolve,reject) => {

            console.log("addtocart",userId);
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})

            console.log("usercart",userCart);

            if(userCart)
            {
                let isProductExist = userCart.products.findIndex(product => product.item.toString() === productId);
                console.log(isProductExist);

                if(isProductExist != -1)
                {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                            user: new ObjectId(userId),
                            'products.item':new ObjectId(productId)
                        },
                        {
                            $inc:{'products.$.quantity': 1}
                        }).then(response => {
                            resolve();
                        })
                }
                else
                {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                            user:new ObjectId(userId)
                        },
                        {
                            $push:{products:productObj}
                        }
                        ).then((response) => {
                                resolve();
                        })
                    }
            }
            else
            {
                let cartObj = {
                    user:new ObjectId(userId),
                    products:[productObj]
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