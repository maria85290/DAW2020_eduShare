
var express = require('express');
var router = express.Router();
const axios = require('axios')
var BagIt = require('bagit-fs')
var path = require('path')
const fs = require('fs')
const jwt_decode = require('jwt-decode');
var unzipper = require('unzipper')
const multer = require('multer')
var ncp = require('ncp').ncp;

const upload = multer({ dest: 'uploads/' })

const utils = require("../utils.js")


// Verifica se a informação se mantem integra
function verify (path, originalname){
    
    console.log("start verify")


    var bagverify = BagIt(path)
       
    // Verify file contents from an existing bag 
    bagverify.readFile(originalname, 'utf-8', function (err, data) {
        if (err) return console.error(err)
        console.log("file verify with success")

    })
   
}


router.get('/', function(req, res, next) {

    let user_id = req.user.username
    console.log(user_id)

    var token = req.cookies.token
    var decoded = jwt_decode(token);

    axios.post('http://localhost:7003/users/' + decoded['mail'])
    .then(data => {
        var user = data.data   
        res.render('index', { view: "import", level:user.level, user: user, list: data.data, resourcesType: utils.resourceTypes})})
    .catch(e => console.log("erro ao obter os dados do utilizador " + e))

})





// Post uploads/files
router.post('/file', upload.single('myFile'), (req, res) => {

    // obter a diretoria da pasta temporaria onde o ficheiro foi guardado
    let dir = __dirname + "/../../api-server/fileStore"
    let dirUpload = __dirname + "/../uploads"
    let user = req.user

    if (req.user.level == "admin"){
    


    // Para obtermos o dia em que se esta a fazer upload
    now = new Date
    let month = ["01","02","03","04","05","06","07", "08", "09", "10", "11", "12"]
    let day =  now.getFullYear()+ "-" + month[now.getMonth()] + "-" + now.getDate()
    
    fs.createReadStream(dirUpload + "/"+ req.file.filename).pipe(unzipper.Extract({path: dirUpload + "/" + req.file.originalname.split(".")[0]})).on('finish', function () {  // finished
        console.log('Done. Now you can start reading.'); 
        var jsonFile = require("./../../app-server/uploads/" + req.file.originalname.split(".")[0]+"/bag.json")
   
   
    var time = new Date();
    
    let resource = {
        id : jsonFile.id,
        name : jsonFile.name,
        title: jsonFile.title,
        subtitle: jsonFile.subtitle,
        id_produces : jsonFile.id_produces,   // fica o seu e-mail associado
        authors: jsonFile.authors,
        dateLastUpdate: day,
        timeLastUpdate : time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
        subject : jsonFile.subject,
        description:jsonFile.description,
        ranking : jsonFile.ranking,
        rankingList : jsonFile.rankingList, 
        size: jsonFile.size,
        mimeType:jsonFile.mimeType,
        type :jsonFile.type,
        visibility :jsonFile.visibility,
        hashtags : jsonFile.hashtags,
        id_post :jsonFile.id_post
    }
    
    console.log(resource)

    jsonFile.posts.forEach(p=> {
        post = {
            id: p.id,
            name_file:p.name_file,
            id_file: p.id_file,
            description: p.description,
            date: p.date,
            time: p.time,
            user_name:p.user_name,
            postType:p.postType,
            comments: p.comments
          }
          console.log(post)

          axios.post('http://localhost:7001/import/post?token=' + req.cookies.token , {"post" :post})
          .then(data =>  {console.log("IMPORT POST - verificado e actualizado")})
          .catch(e => console.log("erro ao inserir o post" + e)) 

    });

    // Verificar o manifesto. Correr o veriffy.

    const srcDir = path.join (dirUpload, req.file.originalname.split(".")[0]);
    const destDir =  path.join (dir,resource.type + "/" + resource.id);

    // To copy a folder or file  
    ncp(srcDir, destDir, function (err) {
    
        if (err) {
            return console.error(err);
        }
        else{
            console.log("Pasta transferida com sucesso!");
            axios.post('http://localhost:7001/import/resource?token=' + req.cookies.token , {"resource" :resource})
            .then(data =>  {   res.render('index', { view: "import", level:user.level, user: user, resourcesType: utils.resourceTypes})})
            .catch(e => console.log("erro ao inserir o recurso" + e))
            }    


});


    });
    const srcDir = path.join (dirUpload, req.file.originalname.split(".")[0]);


    fs.rmdirSync(srcDir, { recursive: true });          
    fs.unlinkSync(dirUpload + "/"+ req.file.filename)

    }

    else{
        res.status(401).jsonp({erro:"You are not authorized to perform this operation"})
    }

})



module.exports = router;