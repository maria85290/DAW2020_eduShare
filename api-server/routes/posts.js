const express = require('express')
var router = express.Router();
const multer = require('multer')


var Posts = require('../controllers/post')

  

router.get('/', (req, res) => {
   
    Posts.list()
    .then(data => {
        res.status(201).json(data)
    })
    .catch(e => res.status(500).jsonp({err: e}))

})

router.get('/file/:id', (req, res) => {
    
    Posts.file(req.params.id)
    .then(data => {
        res.status(201).json(data)
    })
    .catch(e => res.status(500).jsonp({err: e}))

})

//Get posts/:id
router.get('/:id', (req, res) => {
    Posts.lookUp(req.params.id)
    .then(data => {
        console.log("post data: " + data.data)
        res.status(201).json(data)
    })
    .catch(e => res.status(500).jsonp({err: e}))

})

// Post /posts/addPost

router.post('/addPost', (req,res)=>{
    let post = req.body.post
    console.log(post)
    Posts.insert(post)
    .then(data => {
        console.log("Resource successfully inserted in the database"); 
        res.status(201).jsonp({data: data})
    })
    .catch(err => console.error(err))

})



// Post /posts/comment/:id
router.post('/comment/:id', (req, res) => {

    let id = req.params.id
    let comment = req.body.comment

    Posts.addComment(id,comment)
    .then(data => {
        console.log("Comment inserted with success!");
        res.status(201).jsonp({data: data})
    })
    .catch(e => res.status(500).jsonp({err: e}))
})

//Creat post of commentary
router.post('/commentPost', (req, res) => {
    let comment = req.body.comment  // data, text and who did the comment
    let file_name = req.body.file_name

   var time = new Date();
   post = {
     name_file:file_name,
     id_file:comment.id_file,
     date: comment.date,
     user_name : comment.user_name,
     time: time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
     postType:"comment"
   }

    Posts.insert(post)
    .then(data => {
        console.log("Resource successfully inserted in the database");
        res.status(201).jsonp({data: data})
    })
    .catch(err => console.error(err))
})




//Create post of ranking
router.post('/rankingPost', (req, res) => {

    let rankingP = req.body.rankingP
    let file_name = req.body.file_name
    let id_post = req.body.id_post

  
    var time = new Date();
    post = {
        id_post :id_post,
        name_file: file_name,
        id_file:rankingP.id_file,
        user_name : rankingP.user_name,
        date: rankingP.date,
        description:  rankingP.ranking, // store here the ranking value
        time: time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
        postType:"ranking"
    }

    Posts.insert(post)
    .then(data => {
        console.log("Resource successfully inserted in the database");
        res.status(201).jsonp({data: data})
    })
    .catch(err => console.error(err))
})
module.exports = router;