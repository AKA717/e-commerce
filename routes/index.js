var express = require('express');
var router = express.Router();
let MongoClient= require('mongodb').MongoClient;

var url = 'mongodb://127.0.0.1:27017';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Monster' });
});

router.post('/submit',(req,res) => {
  
  console.log(req.body);

  MongoClient.connect(url,(err,db) => {

    if(!err)
      console.log("database connected!");
  })

  });

module.exports = router;