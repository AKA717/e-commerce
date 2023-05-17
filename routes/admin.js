var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');

/* GET users listing. */
router.get('/', async function (req, res, next) {

    let Products = await productHelper.getAllProducts();
    console.log("admin data",Products);

    res.render('admin/view-products', { admin: true, Products })
});

router.get('/add-product',(req,res) => {

    res.render('admin/add-product',{admin:true})
});

router.post('/add-product',(req,res) => {

    productHelper.addProduct(req.body,(id) => {

        let image = req.files.image;
        image.mv('./public/product-images/'+id+'.jpg',(err,done) => {
            if(!err)
            {
                res.render('admin/add-product',{admin:true});
            }
        })
    });
})

module.exports = router;
