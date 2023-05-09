var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {

    let Products = [
        {
            no:1,
            title: "IPAD AIR",
            category: "tablet",
            description: "Latest tech inside !!",
            url: "https://m.media-amazon.com/images/I/71VbHaAqbML._SL1500_.jpg",
            price: '80,000/-'
        },
        {
            no:2,
            title: "IPHONE 14 PRO MAX",
            category: "smartphone",
            description: "Latest tech inside !!",
            url: "https://m.media-amazon.com/images/I/31qeR3U2bdL._SY445_SX342_QL70_FMwebp_.jpg",
            price: '90,000/-'
        },
        {
            no:3,
            title: "MACBOOK AIR",
            category: "laptop",
            description: "Latest tech inside !!",
            url: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ22Z0yLMTKbgxItZTufhGQBaWWyw_dNkrFsLVt1NnzooqAltVAuorrNTjbK3D3iTMuA4e2Uh0GgOeNtbiXMmVvo8Uvc3duu9UhZAk7qkf8Pt1pI1bsBZgRdJoKHNBu04H87nc&usqp=CAc",
            price: '1,00,000/-'
        },
        {
            no:4,
            title: "IMAC",
            category: "pc",
            description: "Latest tech inside !!",
            url: "https://m.media-amazon.com/images/I/61eoyE0l9gS._SX679_.jpg",
            price: '1,15,000/-'
        }
    ]

    res.render('admin/view-products', { admin: true, Products })
});

router.get('/add-product',(req,res) => {

    res.render('admin/add-product',{admin:true})
});

router.post('/add-product',(req,res) => {

    console.log(req.body);
    console.log(req.files.image);
    res.send(req.body);
})

module.exports = router;
