var express = require('express');
var router = express.Router();
let MongoClient= require('mongodb').MongoClient;

var url = 'mongodb://127.0.0.1:27017';

/* GET home page. */
router.get('/', function(req, res, next) {

  let Products = [
    {
      name:"IPAD AIR",
      category:"tablet",
      description:"Latest tech inside !!",
      url:"https://m.media-amazon.com/images/I/71VbHaAqbML._SL1500_.jpg"
    },
    {
      name:"IPHONE 14 PRO MAX",
      category:"smartphone",
      description:"Latest tech inside !!",
      url:"https://m.media-amazon.com/images/I/31qeR3U2bdL._SY445_SX342_QL70_FMwebp_.jpg"
    },
    {
      name:"MACBOOK AIR",
      category:"laptop",
      description:"Latest tech inside !!",
      url:"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ22Z0yLMTKbgxItZTufhGQBaWWyw_dNkrFsLVt1NnzooqAltVAuorrNTjbK3D3iTMuA4e2Uh0GgOeNtbiXMmVvo8Uvc3duu9UhZAk7qkf8Pt1pI1bsBZgRdJoKHNBu04H87nc&usqp=CAc"
    },
    {
      name:"IMAC",
      category:"pc",
      description:"Latest tech inside !!",
      url:"https://m.media-amazon.com/images/I/61eoyE0l9gS._SX679_.jpg"
    }
  ]
  res.render('index', { Products,admin: false });
});

module.exports = router;