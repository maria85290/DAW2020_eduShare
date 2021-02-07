const fs = require('fs')
const express = require('express')
var router = express.Router();
const axios = require('axios')
const jwt_decode = require('jwt-decode');
var path = require('path')

const utils = require('../utils.js')
const zipFolder = require('zip-folder');


const apiServer = utils.apiServer;
const authServer = utils.authServer;

//Search tool - it works as a filter


router.get ('/download/file', (req,res) => {
    console.log ("starting download")
    // Versão inciial do download - download apenas do ficheiro
    if (req.query.export){

        zipFolder("../api-server/viewFile/" + req.query.id, "../api-server/viewFile/" + req.query.id + '.zip', function(err) {
            if(err) {
                console.log('ZIP: Something went wrong!', err);
            }
            else{
            // Elimina a pasta anterior a zipada
            fs.rmdirSync("../api-server/viewFile/" + req.query.id, { recursive: true });
            res.download("../api-server/viewFile/" + req.query.id+".zip")

            }
           
        });
    }

    else{
  // res.download("../api-server/fileStore/"+ req.query.type + "/" +req.query.id + ".zip")
  res.download("../api-server/fileStore/"+ req.query.type + "/" +req.query.id + "/data/" +  req.query.name)
    }
    })



router.get ('/view/file', (req,res) => {

    if (req.query.mimeType.split("/")[1].match(/(pdf|jpg|jpeg|png|ppt|pptx|plain|json|javascript|html|htm|c|py|css)$/)){
  
  
        const dirfile = path.join (__dirname, "../../api-server/fileStore/" + req.query.type + "/" + req.query.id)

        //const auxFile = path.join (__dirname, "../../api-server/viewFile")
        
       // fs.createReadStream(zipfile).pipe(unzipper.Extract({path: auxFile }))
            
       
       
        console.log("O ficheiro " + req.query.name + " vai ser apresentado no ecra. E é do tipo: " + req.query.mimeType)
        
        fs.readFile(dirfile + "/data/" + req.query.name , function (err,data){
            if(err){
                res.json({'status':'error',msg:err});
            }else{
                res.writeHead(200, {"Content-Type": req.query.mimeType});
                res.write(data);
                res.end();       
            }
        })  
     }

    // Caso o ficheiro que se prenda abrir não tiver tipo: pdf, png, jpeg, json, então o download vai ser iniciado. 
    else{
        // Redirecionar para a rota do download
        res.redirect('/search/download/file?id=' + req.query.id + "&type=" + req.query.type + "&name=" + req.query.name)
    }

})



router.get('/', function(req, res, next) {
    if (req.query.hashtag) {
        axios.get(apiServer + '/search/' + req.query.hashtag + '?token=' + req.cookies.token)
            .then(data => {
                let ext = utils.mimetype2faList(data.data)
                res.render('index', {view: "showFiles", list: data.data, user: req.user, ext: ext, resourcesType: utils.resourceTypes})
            })
            .catch(e => console.log("[search] /files : error searching resources with the hashtag " + req.query.hashtag))

    }
    else {
        res.render('index', {view: "login"})
    }
})

router.get('/files', (req, res) => {
    let search = {
        type: "",
        title: "",
        author : ""
    }

    axios.post(authServer + '/users/' + req.user.mail)
    .then(data => {
        var user = data.data
        axios.post(apiServer + '/search/files?token=' + req.cookies.token , {"search": search})
        .then(data => {
            let list = data.data
            let ext = []
            //fa-icon to each resource
            if(list) {
                ext = utils.mimetype2faList(list)
            }
            
            
            res.render('index', {view: "showFiles", user: user, list: list, ext: ext, resourcesType: utils.resourceTypes})
        })
        .catch(e => console.log("[search] /files : error searching resources -- " + e))
    })
    .catch(e => console.log("[search] /files : error getting user data -- " + e))
})

// Post /search/files
router.post('/files', (req, res) => {

    let type = req.body.type?req.body.type.toLowerCase():''
    let title = req.body.title?req.body.title.toLowerCase():''
    let author = req.body.author?req.body.author.toLowerCase():''
    let search = {}
    if (req.body.hashtag) {
        search = {
            hashtag: req.body.hashtag
        }
    }
    
    else {
        search = {
            type: type,
            title: title,
            author : author
        }
    }

    console.log("TYPE: " + req.body.type)

    var token = req.cookies.token
    var decoded = jwt_decode(token);

    axios.post(authServer + '/users/' + decoded['mail'])
    .then(data1 => {
        var user = data1.data
        axios.post(apiServer + '/search/files?token=' + req.cookies.token , {"search": search})
        .then(data => {
            let list = data.data
            //list of users that uploaded each file of the list (get mail e photo)
            //fa-icon to each resource
            let ext = []
            for(idx in list) {
                ext.push(utils.mimetype2fa(list[idx].mimeType))
               
            }

            console.log("LIST " + list)
            res.render('index', {view: "showFiles", user: user, list: list, ext: ext, resourcesType: utils.resourceTypes})
            
        })
        .catch(e => console.log("erro ao pesquisar recursos " + e))
    })
    .catch(e => console.log("erro ao obter os dados do utilizador " + e))

    
})



module.exports = router;