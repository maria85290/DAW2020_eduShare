

const fs = require('fs')
const fse = require('fs-extra');
var ncp = require('ncp').ncp;
const express = require('express')
var router = express.Router();
const multer = require('multer')

const upload = multer({ dest: 'uploads/' })
var BagIt = require('bagit-fs')
var path = require('path')
var axios = require('axios');
//const { resource } = require('../../api-server/app');

const utils = require('../utils.js')

const zipFolder = require('zip-a-folder');
const jwt_decode = require('jwt-decode');
 

// *********************************************** Funções auxiliares ***********************************


//- Função auxiliar, que faz calculos decimais
// Retirado do site: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/round


function decimalAdjust(type, value, exp) {
    // Se exp é indefinido ou zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Se o valor não é um número ou o exp não é inteiro...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Transformando para string
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Transformando de volta
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}



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

// faz bag do documento

function bag (outputDir, filename, originalname , metaInfo){

   
    var bag = BagIt(outputDir, 'sha256', metaInfo)

    fs.createReadStream('uploads/' + filename ).pipe(bag.createWriteStream( "/"+originalname))
    
    console.log('done bagging, finalizing')

    bag.finalize(function (err) {
    if (err) return console.err(err)
    else{
        console.log('bag finalized')

        // verifica a integridade dos dados 
        verify (outputDir, originalname)

    }
  })
}


/// ***********************************************************************************************

router.get('/', function(req, res) {
    var token = req.cookies.token
    var decoded = jwt_decode(token);

    axios.post('http://localhost:7003/users/' + decoded['mail'])
    .then(data => {
        var user = data.data
        res.render('index', {view: "upload", user: user, resourcesType: utils.resourceTypes})
    })
    .catch(e => console.log("erro ao obter os dados do utilizador " + e))
})





// Post uploads/files
router.post('/files', upload.single('myFile'), (req, res) => {
    // obter a diretoria da pasta temporaria onde o ficheiro foi guardado
    let dir = __dirname + "/../../api-server/fileStore"
    let dirUpload = __dirname + "/../uploads"
    

    if (req.user.level == "consumer"){
        req.user.level = "producer"

        console.log("ESTOU A EDITAR O LEVEl" + req.user.mail + req.user.level)
        
        axios.post('http://localhost:7003/users/updateLevel?token=' + req.cookies.token , {"id_producer" :req.user.mail})
        .then(dados =>  {console.log("level do utilizador atualizado com sucesso ")})
        .catch(e => console.log("erro ao atualizar" + e))


    }

    console.log(req.user.level)



    // Para obtermos o dia em que se esta a fazer upload
    now = new Date
    let month = ["01","02","03","04","05","06","07", "08", "09", "10", "11", "12"]
    let day =  now.getFullYear()+ "-" + month[now.getMonth()] + "-" + now.getDate()
   
    let  metaInfo = {
        title: req.body.title,
        subtitle: req.body.subtitle,
        creationDate: req.body.creationDate, 
        registerDate: day, 
        authorName: req.body.authorName, 
        description: req.body.description, 
        type: req.body.type,
        visibility: req.body.visibility
    }

    var time = new Date();

    // os nomes dos autores devem aparecer separados por virgulas.
    let authors = req.body.author.toLowerCase().split(",")

    // As hastags encontram-se claramente separadas por espaços. Pois uma hastag não tem espaços
    let hashtags = req.body.hashtags.toLowerCase().split (" ")
    
    let resource = {
        id : req.file.filename,
        name : req.file.originalname,
        title: req.body.title.toLowerCase(),
        subtitle: req.body.subtitle.toLowerCase(),
        id_produces : req.user.mail ,   // fica o seu e-mail associado
        authors: authors,
        dateLastUpdate: day,
        timeLastUpdate : time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
        subject : req.body.subject,
        description:req.body.description,
        ranking : 0,
        rankingList : [], 
        size:  decimalAdjust('round' , req.file.size / (1024*1024), -1),  // Converte para megaBytes
        mimeType:req.file.mimetype,
        type : metaInfo["type"].toLowerCase(),
        visibility : metaInfo["visibility"],
        hashtags : hashtags
    }
    
    console.log(resource)


   
        // Se o user faz upload de pasta zipad, ela ja esta no formato bagit e falta apenas transferi-la para a apasta correta no fileStore
        if ((req.file.originalname.split(".")[req.file.originalname.split(".").length-1]) == "zip"){
            console.log("A pasta zipada detetada será transferida para  a posição correra no filestore")

        
            const srcDir = path.join (dirUpload, req.file.filename);
            const destDir =  path.join (dir,resource.type + "/" + resource.id + ".zip" );
            
            let aux = resource.type + "/" + resource.id

            var outputDir = path.join(dir, aux)

            bag (outputDir, resource.id , resource.name, resource)

            // Limpa o ficheiro da pasta temporaria uploads
            fs.unlinkSync(dirUpload + "/"+ resource.id)

                // To copy a folder or file  
               // ncp(srcDir, destDir, function (err) {
                
                 //   if (err) {
                   //     return console.error(err);
                   // }
                   // else{
                     //   console.log("Pasta transferida com sucesso!");
                      //  fs.unlinkSync(dirUpload + "/"+ resource.id)

                       // console.log("A pasta transferida. A inserir na base de dados...")

                        axios.post('http://localhost:7001/uploads/files?token=' + req.cookies.token , {"resource" :resource})
                        .then(dados =>  {console.log("Inserido com sucesso na base de dados dos recursos "); res.redirect('http://localhost:7002/myHomePage')})
                        .catch(e => console.log("erro ao inserir o recurso" + e))

                   // }
            
                //});

        }

        // Se faz uplod de um ficheiro é necessario fazer bagit e depois transferir
        else{
            console.log("Upload de ficheiro detetado.")

            let aux = resource.type + "/" + resource.id

            var outputDir = path.join(dir, aux)
            console.log(outputDir)

        
            bag (outputDir, resource.id, resource.name, resource)

            // Limpa o ficheiro da pasta temporaria uploads
            fs.unlinkSync(dirUpload + "/"+ resource.id)
            
            axios.post('http://localhost:7001/uploads/files?token=' + req.cookies.token , {"resource" :resource})
            .then(dados =>  {console.log("Inserido com sucesso na base de dados dos recursos  " + dados); res.redirect('http://localhost:7002/myHomePage')})
            .catch(e => console.log("erro ao inserir o recurso" + e))

        }
    
})



module.exports = router;