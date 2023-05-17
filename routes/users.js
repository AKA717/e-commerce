var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');

var url = 'mongodb://127.0.0.1:27017';

/* GET users home page. */
router.get('/', async function(req, res, next) {

  let Products = await productHelper.getAllProducts();
    console.log("admin data",Products[0]._id);

    res.render('user/view-products', { admin: true, Products })

});

module.exports = router;