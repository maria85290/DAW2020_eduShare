

const fs = require('fs')
const express = require('express')
var router = express.Router();
const multer = require('multer')

const upload = multer({ dest: 'uploads/' })


var Resource = require('../controllers/resource')
var Post = require('../controllers/post')

// Post uploads/files
router.post('/files', (req, res) => {
    if (req.body.resource){
       console.log("entrei no Post uploads/files no api-server")
       var resource = req.body.resource
       console.log(resource)
      

       // Se o recurso foi inserido com sucesso, vamos inserir um post associado
       
       let post_id = "post_"+ resource.id 
       var time = new Date();

       // Cria um post do upload apenas se o ficheiro for de dominio publico
       if (resource.visibility == "public"){
          post = {
            id: post_id,
            name_file:resource.name,
            id_file: resource.id,
            date: resource.dateLastUpdate,
            time: time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
            user_name:resource.id_produces,
            postType:"file",
            comments: []
          }

          Post.insert(post)
          .then(data => {
            console.log("Recurso inserido com sucesso na base de dados de Posts");
            res.status(201).jsonp({data: data})
          })
          .catch(err => console.error(err))
          
          resource.id_post = post.id
      }

       // se for verificado com sucesso, insere-se na base de dados
       Resource.insert(resource)
       .then(data => {
          console.log("Recurso inserido com sucesso na base de dados");
          res.status(201).jsonp({data: data})  
       })
       .catch(err => console.error(err))
       
    

     
    }
    else{
      res.status(500).jsonp({err: "erro"})
    }
})



module.exports = router;