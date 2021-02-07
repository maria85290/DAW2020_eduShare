var express = require('express');
var router = express.Router();
var axios = require('axios')

function verificaAutorizacao(req, res, next){
  if (req.user.level == "admin"){
    next()
  }
  else {
    res.status(401).jsonp({error: "Your authorization level doesn't allow to access this route"})
  }
}

router.get('/', function(req, res, next) {
  res.render('index', {view: "login"})
})

router.get('/myHomePage', function(req, res, next) {
  res.render('index', {view: "initial"})
})


/* GET home page. */ 
/*
router.get('/myHomePage', verificaAutorizacao, function(req, res, next) {
   res.render('myHomepage')
});*/



module.exports = router;
