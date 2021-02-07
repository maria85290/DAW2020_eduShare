var express = require('express');
var router = express.Router();
var axios = require('axios')
//------------------------------------------------------------------REGISTER

router.get(('/register'), function(req, res){
  res.render('index', {view: "register"})
})

router.post(('/register'), function(req, res){
  const username = req.body.username;
  const mail = req.body.mail;
  const filiation = req.body.filiation;
  const password = req.body.password;

  axios.post('http://localhost:7001/users/register', {"username": username, "mail": mail, "filiation": filiation, "password": password})
      .then(dados => {
          var token = dados.data.token
          console.log('Token: ' + token + '\n\n')

          res.cookie('token', token, {
            expires: new Date(Date.now() + '1d'),
            secure: false, // set to true if your using https
            httpOnly: true,
          });
          res.redirect('http://localhost:7002/myHomePage')
      })
      .catch(e => {
          res.render('error', {myMessage: "Couldn't obtain the token! Error: ", error: e})
          console.log('Erro: não consegui obter o token ' + e)
      })
})

//------------------------------------------------------------------LOGIN

router.get('/', function(req, res, next) {
  res.render('index', {view: "login"})
})

router.post('/', function(req, res, next){
  var mail = req.body.mail;
  var password = req.body.password;
  console.log(mail + ' ' + password)
  
  axios.post('http://localhost:7001/users', {"mail": mail, "password": password})
    .then(dados => {
        var token = dados.data.token
        console.log('Token: ' + token + '\n\n')

        //passing token in header
        //var authHeader = "Authorization: Bearer ".concat(token)
          
        //res.header(authHeader)
        
        //res.set('token', token);
        res.cookie('token', token, {
          expires: new Date(Date.now() + '1d'),
          secure: false, // set to true if your using https
          httpOnly: true,
        });
        res.redirect('http://localhost:7002/myHomePage')
       // res.send(token)
    })
    .catch(e => {
        res.render('myError', {myMessage: "The credentials are not valid \n" + e})
        console.log('Erro: não consegui obter o token ' + e)
    })
  
})




module.exports = router;
