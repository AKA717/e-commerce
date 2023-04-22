var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  const shows = ["Silicon Valley","Mr.Robot","Kota Factory","Brototype"]
  const users = {   
                    user1 : {name:"Alwin",admin:true},
                    user2 : {name:"Joyal",admin:false}
                };
  res.render('about',{users});
});

module.exports = router;