

const fs = require('fs')
const express = require('express')
var router = express.Router();
const axios = require('axios')
const multer = require('multer')

const upload = multer({ dest: 'uploads/' })


var Resource = require('../controllers/resource')
var Post = require ('../controllers/post')


// Post /edit/files


router.get('/delete/file/:id', (req, res) => {
    console.log("Iniciou procura pelo ficheiro que se pretende remover")
   
    let id = req.params.id  // id do ficheiro

    // Eliminar tb os posts

    Post.file(id)
    .then(data => {
        data.forEach(d => {
            Post.delete(d.id)
            .then(data2 => {"eliminado com sucesso"})
            .catch(e => res.status(500).jsonp({err: e}))
    });
    })
    .catch(e => res.status(500).jsonp({err: e}))

    
    Resource.delete(id)
    .then(data => {
        if (req.query.level == "admin") {
            Resource.listAll()
                .then(data2 => res.status(201).json(data2))
                .catch(e => res.status(500).jsonp({err: e}))
        }
        else {
            Resource.listProducer(req.query.user)
                .then(data2 => res.status(201).json(data2))
                .catch(e => res.status(500).jsonp({err: e}))
        }
    })
    .catch(e => res.status(500).jsonp({err: e}))
    
})


// Post edit/delete/comment
router.post('/delete/comment', (req, res) => {
    console.log("Iniciou procura pelo comentario que se pretende remover")
   
    let post = req.body.post
    console.log(post.comments)
    console.log(post.id_post)
    console.log("------------------------------------")
  
    // limpa tb o ficheiro da pasta filestore
  //  fs.unlinkSync(dirFicheiro + "/"+ id); 

    Post.updateComments(post.comments, post.id_post)
    .then(data => {console.log("DATA delete haha" + data); res.status(201).json(data)})
    .catch(e => res.status(500).jsonp({err: e}))
    
})



router.get('/allFiles', (req, res) => {
        Resource.list()
        .then(data => { res.status(201).json(data)})
        .catch(e => res.status(500).jsonp({err: e}))
})


// Post /edit/files
// Retorna todas as entradas da base de dados de um dado utilizador

router.post('/files', (req, res) => {
    console.log("Iniciou procura pelos ficheiros de um utilizador")
    if (req.user.level == "admin"){
        Resource.list()
        .then(data => {console.log("DATA edit haha" + data); res.status(201).json(data)})
        .catch(e => res.status(500).jsonp({err: e}))
    }
    else if (req.body.user_id){
        let user = req.body.user_id   // e-mail do utilizador
        console.log(user)

        Resource.listProducer(user)
        .then(data => {console.log("DATA edit haha" + data); res.status(201).json(data)})
        .catch(e => res.status(500).jsonp({err: e}))
    }
})


// Atualiza os dados do ficheiro na base de dados
router.put('/file', (req, res) => {
    console.log("Update de um file na base de dados")
   // let id = req.params.id   // e-mail do utilizador
    let resource = req.body.resource

    Resource.update(resource)
    .then(data => res.status(201).json(data))
    .catch(e => {
        console.log("[edit] couldn't update the resource")
        res.status(500).jsonp({err: e})
    })
})


// Atualiza os raning do ficheiro na base de dados
router.post('/file/updateRanking', (req, res) => {
    console.log("Update de um ranking na base de dados")
   // let id = req.params.id   // e-mail do utilizador
    let resource = req.body.resource
    console.log(resource)

    Resource.updateRanking(resource)
    .then(data => res.status(201).json(data))
    .catch(e => res.status(500).jsonp({err: e}))
})

module.exports = router;