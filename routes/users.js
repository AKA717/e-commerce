var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');
var userHelper = require('../helpers/user-helper');

const verifyLogin = (req,res,next) => {

  console.log("verifylogin : ",req.session.user)

  if(req.session.user)
  {
    next();
  }
  else
  {
    res.redirect('/login');
  }
}

/* GET users home page. */
router.get('/', async function(req, res, next){

  let user = req.session.user;
  //let userCookie = req.cookies.username;

  let cartCount = null;

  if(req.session.user)
  {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }

  let Products = await productHelper.getAllProducts();

  console.log("cartCount",cartCount);

  res.render('user/view-products', { Products, user, cartCount })

});

//route to get edit profile
router.get('/edit-profile',verifyLogin,(req,res) => {

  userHelper.getUser(req.session.user._id).then(user => {

    console.log("user-profile",user);

    if(user)
      res.render('user/edit-profile',{user});
  })
});

//route to delete product from cart.
router.post('/delete-cart-product',(req,res) => {

  console.log(req.body);

  userHelper.deleteCartProduct(req.body).then(() =>{

    res.json({status:true})
  })
})

//route to verify razorpay payment.
router.post('/verify-payment',(req,res) => {

  console.log("verify",req.body);

  userHelper.verifyPayment(req.body).then(() => {

    userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {

      res.json({status:true});

    })

  }).catch((err) => {

      res.json({status:false});

  })
})

//route to view the ordered products.
router.get('/view-order-products/:id',async (req,res) => {

  let products = await userHelper.getOrderProducts(req.params.id);
  console.log("orderArray",products);
  res.render('user/view-order-products',{user:req.session.user,products})
})


//route to return orders page.
router.get('/orders',verifyLogin,async (req,res) => {

  console.log("order session ",req.session.user);

  let orders = await userHelper.getUserOrders(req.session.user._id)

  orders = orders.map(order => {
    let date = order.date.toDateString() + " , " + order.date.toLocaleTimeString()

    order.date = date
    return order;
  })

  res.render('user/orders',{orders,user:req.session.user});

})

//route to return order success page.
router.get('/order-success',(req,res) => {

  res.render('user/order-success',{user:req.session.user});
})

//route for checkout to place order.
router.post('/checkout',async (req,res) => {

  console.log("body",req.body)
  let products = await userHelper.getCartProductList(req.body.userId);
  let totAmt = await userHelper.getTotalAmount(req.body.userId);
  userHelper.placeOrder(req.body,products,totAmt).then(orderId => {
    console.log(orderId);

    if(req.body.paymentMethod === 'COD')
    {
      res.json({codSuccess:true});
    }
    else
    {
      userHelper.generateRazorpay(orderId,totAmt).then(order => {

        res.json(order);
      })
    }
    
  })

})

//route to return place order page.
router.get('/place-order',verifyLogin,async (req,res) => {

  let total = await userHelper.getTotalAmount(req.session.user._id)

  res.render('user/place-order',{total,user:req.session.user});
})

//route to increment or decrement product quantity.
router.post('/change-product-quantity',(req,res,next) => {

  userHelper.changeProductQuantity(req.body).then(async (response) => {

    console.log("inc/dec",req.body.user);

    response.total = await userHelper.getTotalAmount(req.body.user);

    console.log("response",response);

    res.json(response);
  })
}) 

//route to add the items to cart.
router.get('/add-to-cart/:id',(req,res) => {

  console.log(req.params.id);
  console.log("api call");

  userHelper.addToCart(req.params.id,req.session.user._id).then(() => {
  res.json({status:true});
  })
})

//cart router to return the cart hbs file.
router.get('/cart',verifyLogin,async (req,res) => {

  const products = await userHelper.getCartProducts(req.session.user._id);

  let totalAmt = 0;
  if(products.length > 0)
  {
    totalAmt = await userHelper.getTotalAmount(req.session.user._id);
  }

  console.log(products);
  console.log(req.session.user);

  res.render('user/cart',{products,user:req.session.user,totalAmt});
})

//login get router to destroy the session
router.get('/logout',(req,res) => {

  console.log("logout",req.session.user)

  //res.clearCookie("usercookie");

  req.session.user = null;
  res.redirect('/');

})

//login get router to provide login hbs template.
router.get('/login',(req,res) => {

  if(req.session.user)
  {
    res.redirect('/')
  }
  else
  {
    console.log(req.session.userLoginErr);
    res.render('user/login',{"Error":req.session.userLoginErr});
    req.session.userLoginErr = null;
  }
})

//login post router to login.
router.post('/login',(req,res) => {

  userHelper.doLogin(req.body).then(response => {

    if(response.status)
    {
      req.session.user = response.user;
      req.session.user.loggedIn = true;
      console.log("login : ",req.session.user)
      // res.cookie("usercookie",`req.user`,
      // {
      //   maxAge: 1209600000,
      //   httpOnly:true,
      //   sameSite:'strict'
      // });
      res.redirect('/');
    }
    else{
      req.session.userLoginErr = "Invalid Credentials";
      res.redirect('/login');
    }
  })
})

//signup get router to provide signup hbs template.
router.get('/signup',(req,res) => {

  res.render('user/signup');
})

//signup post router to create the user.
router.post('/signup',(req,res) => {

  userHelper.doSignUp(req.body).then((response) => {
    console.log(response);

    req.session.user = response;
    req.session.user.loggedIn = true;

    res.redirect('/');
  })

})

module.exports = router;