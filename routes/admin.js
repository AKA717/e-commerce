var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');
const userHelper = require('../helpers/user-helper');

const verifyLogin = (req,res,next) => {
  
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

    res.render('admin/view-products', { admin: true, Products,user:req.session.admin })
});

//route to delete an user.
router.post('/delete-user',(req,res) => {

    userHelper.deleteUser(req.body.user_id).then(response => {

        res.json({status:true})
    })
})

//route to get all users.
router.get('/all-users',verifyLogin,async (req,res) => {

    let users = await userHelper.getAllUsers();

    if(users)
    {
        res.render('admin/all-users',{admin:true,users,user:req.session.admin})
    }
    else{
        res.redirect('/admin');
    }
})

//route to view the ordered products.
router.get('/view-order-products/:id',verifyLogin,async (req,res) => {

    let products = await userHelper.getOrderProducts(req.params.id);
    res.render('admin/view-order-products',{admin:true,user:req.session.admin,products})
})

//route to get all orders.
router.get('/all-orders',verifyLogin,async (req,res) => {

    let orders = await userHelper.getAllOrders()

    orders = orders.map(order => {
        let date = order.date.toDateString() + " , " + order.date.toLocaleTimeString()

        order.date = date
        return order;
    })

    res.render('admin/all-orders',{orders,user:req.session.admin,admin:true});
})

//login get router the admin session
router.get('/admin-logout',(req,res) => {
  
    req.session.admin = null;
    res.redirect('/');
  
  })

//route for admin login.
router.post('/admin-login',(req,res) => {

    userHelper.doAdminLogin(req.body).then(response => {

        if(response.status)
        {
          req.session.admin = response.user;
          req.session.admin.loggedIn = true;
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

    const product = await productHelper.getProductInfo(req.params.id);

    res.render('admin/edit-product',{product});
})

//delete route to remove an item.
router.get('/delete-product/:id',(req,res) => {

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
