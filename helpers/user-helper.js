const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;
const Razorpay = require('razorpay');

var instance = new Razorpay(
    { 
        key_id: 'rzp_test_j1CanzsbNKEoGw',
        key_secret: 'rN8DWaRIuCbeCUIFzMHeuFaq' 
    })

module.exports = {

    getAllUsers : () => {

        return new Promise(async (resolve,reject) => {

            let users = await db.get().collection(collection.USERS_COLLECTION).find();

            resolve(users);
        })
    },

    getAllOrders : () => {

        return new Promise(async (resolve,reject) => {
            
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();

            resolve(orders);
        })
    },

    deleteCartProduct : (cartInfo) => {
        console.log("delete helper",cartInfo);

        return new Promise((resolve,reject) => {

            db.get().collection(collection.CART_COLLECTION)
            .updateOne(
            {
                _id:new ObjectId(cartInfo.cart_id)
            },
            { 
                $pull: { 'products': { 'item': new ObjectId(cartInfo.product_id) } }
            }
            ).then(response => {
                resolve();
            })
        })
    },

    doAdminLogin : (adminData) => {

        return new Promise(async (resolve, reject) => {

            let loginStatus = false;
            let response = {};

            const user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({admin : adminData.admin});
            
            if(user)
            {
                bcrypt.compare(adminData.password,user.password).then(status => {

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
    },

    changePaymentStatus : (orderId) => {

        return new Promise((resolve,reject) => {

            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne(
                {
                    _id:new ObjectId(orderId)
                },
                {
                    $set:{
                        status:'placed'
                    }
                }
                ).then(() => {

                    resolve()
                })
        })
    },

    verifyPayment : (orderInfo) => {

        return new Promise((resolve,reject) => {

            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256','rN8DWaRIuCbeCUIFzMHeuFaq')

            console.log(orderInfo['payment[razorpay_order_id]'],orderInfo['payment[razorpay_payment_id]']);

            hmac.update(orderInfo['payment[razorpay_order_id]']+'|'+orderInfo['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')

            console.log("hmac : ",hmac);
            console.log("order Sig : ",orderInfo['payment[razorpay_signature]']);

            if(hmac === orderInfo['payment[razorpay_signature]'])
            {
                resolve();
            }
            else
            {
                reject();
            }
        })
    },

    generateRazorpay : (orderId,totalAmt) => {

        return new Promise((resolve,reject) => {

            instance.orders.create({
                amount: parseInt(totalAmt)*100,
                currency: "INR",
                receipt: orderId,
              },
              (err,order) => {
                console.log("razor order : ",order);
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    resolve(order)
                }
              })
        })
    },

    getOrderProducts : (orderId) => {

        return new Promise(async (resolve,reject) => {

            console.log("orderId",orderId);

            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                  $match: { _id: new ObjectId(orderId) } // Match by the _id field instead of the user field
                },
                {
                  $unwind: '$products'
                },
                {
                  $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'products.item',
                    foreignField: '_id',
                    as: 'product'
                  }
                },
                {
                  $project: {
                    _id: 0, // Exclude the _id field if not needed
                    item: '$products.item',
                    quantity: '$products.quantity',
                    product: { $arrayElemAt: ['$product', 0] }
                  }
                }
              ]).toArray();              

            console.log("getOrderProducts",orderItems);
            resolve(orderItems);
        })
    },

    getUserOrders : (userId) => {

        return new Promise(async (resolve,reject) => {
            
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId: new ObjectId(userId)}).toArray();
            resolve(orders);
        })
    },

    placeOrder : (order,products,totAmount) => {

        return new Promise((resolve,reject) => {

            console.log(order,products,totAmount);
            let status = order.paymentMethod === 'COD'? 'placed': 'pending'

            let orderObj = {
                deliveryInfo : {
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:new ObjectId(order.userId),
                paymentMethod: order.paymentMethod,
                products:products,
                status:status,
                date:new Date(),
                totalAmount:totAmount
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) =>{
                console.log(response.insertedId.toString());
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(order.userId)})
                resolve(response.insertedId.toString())
            })
            
        })
    },

    getCartProductList : (userId) => {

        return new Promise(async (resolve,reject) => {

            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})

            resolve(cart.products);
        })
    },

    getTotalAmount : (userId) => {

        console.log("total start",userId);

        return new Promise(async (resolve,reject) => {

            const total = await db.get().collection(collection.CART_COLLECTION).aggregate([

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
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}}
                    }
                }
            ]).toArray()

            console.log("total",total);
            resolve(total[0].total);
        })

    },

    changeProductQuantity : ({cart,product,count,quantity}) => {

        console.log(cart,product,count,quantity);

        return new Promise((resolve,reject) => {

            if(quantity == 1 && count == -1)
            {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne(
                    {
                        _id: new ObjectId(cart)
                    },
                    {
                        $pull:{products:{item:new ObjectId(product)}}
                    }
                    ).then(response => {

                        resolve({removeProduct : true})
                    })
            }
            else
            {
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
                                    resolve({status:true});
                                })
                }
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