var express = require('express');
var router = express.Router();
var axios = require("axios")
const jwt_decode = require('jwt-decode');

const utils = require('../utils.js')
const apiServer = utils.apiServer;
const authServer = utils.authServer;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/login')
});


router.get('/myHomePage', function(req, res, next) {

  if(req.cookies.token) {
    let token = req.cookies.token
    var decoded = jwt_decode(token);

    let userMail = decoded['mail']

    axios.post(authServer + '/users/' + userMail)
    .then(data => {
      var user = data.data

      axios.get(apiServer + '/posts?token=' + req.cookies.token)
      .then(data => {
        let list = data.data
        axios.get(apiServer + '/search/mostStarred?token=' + req.cookies.token)
          .then(data2 => {
            console.log("listTOP10 " + data2.data)
            res.render('index', {view: "initial", user: user, list: list, listTop10: data2.data, resourcesType: utils.resourceTypes})
          })
          .catch(e => console.log("[index] /myHomePage : error getting most starred docs -- " + e))
      })
      .catch(e => {
          //verificar se erro é 401
          console.log("[index /myHomePage] SESSION EXPIRED")
          res.render('myError', {view: "sessionExpired"})
        
      })  
    })
    .catch(e => console.log("[index /myHomePage] error getting user data" + e))
  }
  else {
    res.render('myError', {view: "noSession"})
  }
  
})

router.get('/logout', function(Req, res, next) {
  res.clearCookie('token')
  res.redirect('/')
})


router.get('/profile', function(req, res, next) {
  
  //get user mail
  var token = req.cookies.token
  var decoded = jwt_decode(token);
  let userMail = decoded['mail']
  //----------------------

  if(req.query.user) {
    userMail = req.query.user
  }

  axios.post(authServer + '/users/' + userMail)
  .then(data => {
    var user = data.data
    axios.post(apiServer + '/search/files/' + userMail + '?token=' + token)
      .then(data => {
        let list = data.data
        let ext = utils.mimetype2faList(list)
        res.render("index", {view: "profile", user: user, files: list, ext: ext, resourcesType: utils.resourceTypes})
      })
      .catch(err => console.log("[index] /logout error getting user resources -- " + err))
    
  })
  .catch(e => console.log("[index] /logout : error getting user data -- " + e))
})


module.exports = router;
