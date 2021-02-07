
var express = require('express');
var router = express.Router();
var Posts = require('../controllers/post')

var Resource = require('../controllers/resource')

  


router.post('/post', (req, res) => {
    let post = req.body.post

    Posts.insert_update(post)
    .then(data => {console.log("Post inserido com sucesso na base de dados de Posts");res.status(201).jsonp({data: data})})
    .catch(err => console.error(err))
})

router.post('/resource', (req, res) => {
    let r = req.body.resource

    Resource.insert_update(r)
    .then(data => {console.log("Recurso inserido com sucesso na base de dados de Posts");res.status(201).jsonp({data: data})})
    .catch(err => console.error(err))
})



module.exports = router;