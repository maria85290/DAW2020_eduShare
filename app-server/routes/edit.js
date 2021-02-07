var express = require('express');
var router = express.Router();
const axios = require('axios')
const jwt_decode = require('jwt-decode');

const utils = require('../utils.js');
var path = require('path')
const fs = require('fs');

const apiServer = utils.apiServer;
const authServer = utils.authServer;

router.get('/myResources', function(req, res, next) {

    let user_id = req.user.mail;
    axios.post(apiServer + '/edit/files?token=' + req.cookies.token , {"user_id": user_id})
        .then(data => {
            let ext = utils.mimetype2faList(data.data)
            console.log("[edit] /myResources -- resources data -- " + data.data); res.render('index', { view: "showFilesEdit", user: req.user, list: data.data, resourcesType: utils.resourceTypes, ext: ext})
        })
        .catch(e => console.log("[edit /myResources] error getting resources to edit -- " + e))

})

// GET /edit/:id
router.get('/:id', function(req, res,next) {

    axios.get(apiServer + '/search/file/' + req.params.id + '?token=' + req.cookies.token)
    .then(data => {

        //get extension of the file
        let ext = utils.mimetype2fa(data.data.mimeType)
        
        res.render('index', {view: "edit", user: req.user, extension: ext, resource: data.data, resourcesType: utils.resourceTypes, visibilityTypes: utils.visibilityTypes})
    })
    .catch(e => console.log("[edit/:id] -- error getting resource data -- " + e))
})

// Post /edit/delete/:id

// Retorna todas as entradas da base de dados de um dado utilizador
router.get('/delete/file/:id', (req, res) => {
    
    let id= req.params.id

    axios.get(apiServer + '/edit/delete/file/' + id + '?user=' + req.user.mail + '&level=' + req.user.level + '&token=' + req.cookies.token)
    .then(data => res.render('index', {view: "showFilesEdit", user: req.user, list: data.data, resourcesType: utils.resourceTypes}))
    .catch(e => console.log("erro ao eliminar recurso " + e))
    
})


// Retira o comenatiro que se pretende eliminar para depois colocar a lista
function retira_Comentario (post, id_comment){
    lista = []
        post.comments.forEach(c => {
            if (c.id != id_comment){
                lista.push(c)
            }
        });
             
    return lista
}    
   // GET /edit/delete/comment/

router.get('/delete/comment/:id', (req, res) => {

    console.log("Iniciou procura pelo ficheiro que se pretende remover")
    
    let post_id = req.query.post_id
    let id_file = req.query.id_file
    
    let id_comment = req.params.id


    console.log("ID_ COMMENT" + id_comment)

 

    axios.get(apiServer + '/posts/' + post_id + '?token=' + req.cookies.token)
    .then(data => { let post = {
                    id_post : post_id,
                    comments : retira_Comentario(data.data, id_comment)

                   }; console.log(post); axios.post(apiServer + '/edit/delete/comment/?token=' + req.cookies.token, {"post":post})
                        .then(data => res.redirect("/file?id_file=" +id_file + "&id_post=" + post_id + "&user=" + req.user.mail))
                        .catch(e => console.log("erro ao eliminar comentario " + e))}
    )
    .catch(e => console.log("erro ao procurar post  " + e))
})

// Post /edit/delete/:id

// Retorna todas as entradas da base de dados de um dado utilizador
router.get('/delete/file/:id', (req, res) => {

    console.log("Iniciou procura pelo ficheiro que se pretende remover")
    
    let id= req.params.id

    console.log(id)

    axios.get(apiserver + '/edit/delete/file/' + id + '?token=' + req.cookies.token)
    .then(data => res.redirect('/edit'))
    .catch(e => console.log("erro ao eliminar recurso " + e))
    
})


// Retira o comenatiro que se pretende eliminar para depois colocar a lista
function retira_Comentario (post, id_comment){
    lista = []
        post.comments.forEach(c => {
            if (c.id != id_comment){
                lista.push(c)
            }
        });
             
    return lista
}    
   


// GET /edit/delete/comment/

router.get('/delete/comment/:id', (req, res) => {

    console.log("Iniciou procura pelo ficheiro que se pretende remover")
    
    let post_id = req.query.post_id
    let id_file = req.query.id_file
    
    let id_comment = req.params.id


    console.log("ID_ COMMENT" + id_comment)

 

    axios.get('http://localhost:7001/posts/' + post_id + '?token=' + req.cookies.token)
    .then(data => { let post = {
                    id_post : post_id,
                    comments : retira_Comentario(data.data, id_comment)

                   }; console.log(post); axios.post('http://localhost:7001/edit/delete/comment/?token=' + req.cookies.token, {"post":post})
                        .then(data => res.redirect("/file?id_file=" +id_file + "&id_post=" + post_id + "&user=" + req.user.mail))
                        .catch(e => console.log("erro ao eliminar comentario " + e))}
    )
    .catch(e => console.log("erro ao procurar post  " + e))

 
})


// Post /edit/file/:id  --> Para concluir a edição
router.post('/file/:id', (req, res) => {

    // Para obtermos o dia em que se esta a fazer upload
    now = new Date
    let month = ["01","02","03","04","05","06","07", "08", "09", "10", "11", "12"]
    let day = now.getFullYear()+ "-" + month[now.getMonth()] + "-" + now.getDate()

    let name = req.query.name

    resource = {
        id : req.params.id,
        title: req.body.title.toLowerCase(),
        subtitle: req.body.subtitle,
        authors: req.body.authors.toLowerCase(),
        dateLastUpdate: day,
        name: name,
        subject : req.body.subject,
        description:req.body.description,
        visibility: req.body.visibility,
        type: req.body.type,
        hashtags: req.body.hashtags
    }
   
    console.log(resource)
    
    axios.put(apiServer + '/edit/file/?token=' + req.cookies.token , {"resource":resource})
        .then(data => res.render('index', {view: "editConfirmPage", id_file: resource.id, user: req.user, resourcesType: utils.resourceTypes}))
        .catch(e => console.log("erro ao realizar update do recurso " + e))
})

router.post("/newTypeResource", function(req, res) {
    utils.addResourceType(req.body.type);
    console.log("UTILS NEW " + utils.resourceTypes)
    res.render('index', {view: "statistics", user: req.user, resourcesType: utils.resourceTypes})
})
    
module.exports = router;