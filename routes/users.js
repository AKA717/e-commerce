var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');

/* GET users home page. */
router.get('/', async function(req, res, next) {

  let Products = await productHelper.getAllProducts();
    //console.log("admin data",Products[0]._id);

    res.render('user/view-products', { admin: false, Products })

});

module.exports = router;