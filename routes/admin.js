var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');

/* GET users listing. */
router.get('/', async function (req, res, next) {

    let Products = await productHelper.getAllProducts();
    console.log("admin data",Products[0]._id);

    res.render('admin/view-products', { admin: true, Products })
});

//edit-product route to edit the item details.
router.post('/edit-product/:id',(req,res) => {

    console.log(req.params.id)
    productHelper.updateProduct(req.params.id,req.body).then(() => {

        if(req.files.image)
        {
            let image = req.files.image;
            image.mv('./public/product-images/'+req.params.id+'.jpg')
        }

        res.redirect('/admin')
    })
})

//edit-product router to return edit-product hbs template.
router.get('/edit-product/:id',async (req,res) => {

    console.log(req.params.id);

    const product = await productHelper.getProductInfo(req.params.id);

    console.log(product);

    res.render('admin/edit-product',{product});
})

//delete route to remove an item.
router.get('/delete-product/:id',(req,res) => {

    console.log(req.params.id);

    productHelper.deleteProduct(req.params.id).then(response => {

        res.redirect('/admin');
    })
})

//add-product route to return add-product hbs file.
router.get('/add-product',(req,res) => {

    res.render('admin/add-product',{admin:true})
});

//add-product route to add an item to the database.
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
