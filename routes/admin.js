var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');
const userHelper = require('../helpers/user-helper');

const verifyLogin = (req,res,next) => {

    console.log("verifylogin : ",req.session.admin)
  
    if(req.session.admin)
    {
      next();
    }
    else
    {
      res.redirect('/admin/admin-login');
    }
  }

/* GET users listing. */
router.get('/',verifyLogin, async function (req, res, next) {

    let Products = await productHelper.getAllProducts();
    console.log("admin data",Products[0]._id);

    res.render('admin/view-products', { admin: true, Products })
});

//login get router the admin session
router.get('/admin-logout',(req,res) => {

    console.log("logout",req.session.admin)
  
    req.session.admin = null;
    res.redirect('/');
  
  })

//route for admin login.
router.post('/admin-login',(req,res) => {
    console.log(req.body);
    userHelper.doAdminLogin(req.body).then(response => {

        if(response.status)
        {
          req.session.admin = response.user;
          req.session.admin.loggedIn = true;
          console.log("admin-login : ",req.session.admin)
          res.redirect('/admin');
        }
        else{
          req.session.userLoginErr = "Invalid Credentials";
          res.redirect('/login');
        }
      })
})

//route tp admin login page.
router.get('/admin-login',(req,res) => {

    res.render('admin/admin-login',{admin:true});
})

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
router.get('/edit-product/:id',verifyLogin,async (req,res) => {

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
router.get('/add-product',verifyLogin,(req,res) => {

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
