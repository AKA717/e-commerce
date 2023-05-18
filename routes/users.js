var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');
var userHelper = require('../helpers/user-helper');

/* GET users home page. */
router.get('/', async function(req, res, next) {

  let user = req.session.user;
  console.log(user);

  let Products = await productHelper.getAllProducts();

    res.render('user/view-products', { Products, user })

});

//login get router to destroy the session
router.get('/logout',(req,res) => {

  req.session.destroy();
  res.redirect('/');
  
})

//login get router to provide login hbs template.
router.get('/login',(req,res) => {

  res.render('user/login');
})

//login post router to login.
router.post('/login',(req,res) => {

  userHelper.doLogin(req.body).then(response => {

    req.session.loggedIn = true;
    req.session.user = response.user;

    if(response.status)
    {
      res.redirect('/');
    }
    else{
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
  })

})

module.exports = router;