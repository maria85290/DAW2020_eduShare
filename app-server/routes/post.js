
var express = require('express');
var router = express.Router();
const axios = require('axios')
var mime = require('mime-types')
const { v4: uuidv4 } = require('uuid');
const jwt_decode = require('jwt-decode');

const utils = require('../utils.js');

const apiServer = utils.apiServer;
const authServer = utils.authServer;

// GET /post/
router.get('/', (req,res) =>{
    let id_file = req.query.id
    let name_file = req.query.name

    console.log(id_file)

    let mime_type = mime.contentType(name_file)
    let ext = utils.mimetype2fa(mime_type.split(';')[0])

    res.render('index', {view: "post_File", extension: ext, user: req.user, id_file: id_file, name_file: name_file, resourcesType: utils.resourceTypes})

})



router.post('/', (req, res) => {
    let id_file = req.query.id_file
    let name_file = req.query.name_file
    let post_text = req.body.post
   
    now = new Date
    let month = ["01","02","03","04","05","06","07", "08", "09", "10", "11", "12"]
    let day =  now.getFullYear()+ "-" + month[now.getMonth()] + "-" + now.getDate()
   
    
    var time = new Date();
   
    let post_id = uuidv4();
    
    post = {
      id: post_id,
      name_file:name_file,
      id_file: id_file,
      description: post_text,
      date: day,
      time: time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
      user_name: req.user.mail,
      postType: "share",
      comments: []
    }

    console.log(post)

    axios.post(apiServer + '/posts/addPost?token=' + req.cookies.token , {"post" :post})
    .then(dados =>  {console.log("DADOS " + dados); res.redirect('http://localhost:7002/myHomePage')})
    .catch(e => console.log("erro ao inserir o recurso" + e))

  
  
})



module.exports = router;