// 1º ir buscar uma lista de e-mails (para associar o id_producer)

var fs = require('fs')
var axios = require('axios')
var path = require('path')
const { v4: uuidv4 } = require('uuid');
const zipFolder = require('zip-a-folder');
var ncp = require('ncp').ncp
let getFileProperties= require('get-file-properties')
 
var BagIt = require('bagit-fs')

var buffer=require('buffer').Buffer
var Resource = require('./controllers/resource')
var users = require('./../auth-server/initialUsers.json');
var Post = require('./controllers/post')
const mime = require('mime');

var mongoose = require('mongoose');


//---------------------------------------------------------MONGO CONNECTION

var mongoDB = 'mongodb://127.0.0.1/default';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;


//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error...'));
db.once('open', function() {
    console.log("Connection to MongoDB succeded...")
});

//-------------------------------------------------------------------------



// *********************************************** Funções auxiliares ***********************************

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
function bag (outputDir,originalname , metaInfo, type){

    var bag = BagIt(outputDir , 'sha256', metaInfo)

    fs.createReadStream('UploadsApi/' + originalname ).pipe(bag.createWriteStream( "/" +originalname))
    
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

// Para realizar a seleção aleatorea de um elemnto num array
function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }



  function chooseType (mimeType) {
   if (mimeType == "text/plain"){
            return ["exercises", "test", "others"]
    }
    
    else if ( mimeType == "application/pdf"){
        return ["test", "slides", "report", "others", "exercises"]
        } 
        
    else if ( mimeType == "image/png" || mimeType == "image/jpeg" ){
         return ["exercises", "others"]
    }
    else{
     return ["others"]
    }
}


// Função que dada a extenção dá o mimeType
function mimeType (ext){
  return mime.getType(ext); 
}


// Faz arredondamentos
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



//Vai buscar o tamanho do ficheiro
function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return decimalAdjust("round" ,fileSizeInBytes / (1024*1024), -1);
}

/// ***********************************************************************************************


// 1º) Vamos ler os nomes e e-mails das pessoas que temos na base de dados

  users_mail = []
  users_name = []
  users.forEach(u => {
    if (u.level == "producer"||u.level =="admin" ){
      users_mail.push(u.mail)
      users_name.push(u.name)
  }
 })


 // 2º) Para cada ficheiro que esta na pasta upload vamos fazer bagit
  
  fs.readdir('./UploadsApi',function(err,files){
    if (err) {
      console.log(err); 
    }

   else { 
      files.forEach(originalname => {

          console.log(originalname)


            //Gerar um id_aleatorio que fica o nome da pasta 
            let file_id = uuidv4();

            let dir = __dirname + "/fileStore"
            let dirUpload = __dirname + "/UploadsApi"
            
            // Para obtermos o dia em que se esta a fazer upload
            now = new Date
            let month = ["01","02","03","04","05","06","07", "08", "09", "10", "11", "12"]
            let day =  now.getFullYear()+ "-" + month[now.getMonth()] + "-" + now.getDate()


            // Para gerar um data
            var time = new Date();

            // estenção do ficheiros
            let ext = originalname.split(".")[originalname.split(".").length -1]
            

            
           let resource = {
                id : file_id,
                name : originalname,
                title: originalname.split(".")[0],  // o titulo para já fica o nome sem a extençao do ficheiro
                subtitle: " ",
                id_produces :  choose(users_mail),   // um elemnto da lista users_mail
                authors: [choose(users_name)],
                dateLastUpdate: day,
                timeLastUpdate : time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
                subject : "undefined",
                description: "undefined",
                posts : [],
                ranking : 0,
                rankingList : [], 
                type : choose(["test","others", "report","exercises","slides"]),
                size: getFilesizeInBytes("./UploadsApi/" + originalname),
                mimeType: mimeType(ext),
                visibility : choose(["public", "private"]),
                hashtags : []
            }

            

            let type = choose(chooseType(resource.mimeType))
            resource.type = type

           

                  // Cria o post do ficheiro inserido
              let post_id = "post_"+ resource.id 
              var time = new Date();

              if (resource.visibility == "public"){
                  post = {
                    id: post_id,
                    name_file: resource.name,
                    id_file: resource.id,
                    date: resource.dateLastUpdate,
                    time: time.getHours() + ":" + time.getMinutes()  + ":" + time.getSeconds(),
                    user_name: resource.id_produces,
                    postType: "file",
                    comments: []
                  }

                  resource.id_post = post_id



                  Post.insert(post)
                  .then(data => {console.log("post inserido com sucesso na base de dados de Posts");})
                  .catch(err => console.error(err))
              }
              console.log(resource)
        
    


            //Realiza o bag do ficheiro a fazer uploadsApi
            metaInfo = resource

            console.log(resource.type)

            let aux = resource.type + "/" + file_id

            var outputDir = path.join(dir, aux)
            console.log(outputDir)

           
            bag (outputDir, originalname, metaInfo, resource.type)

            // Limpa o ficheiro da pasta temporaria uploads
           fs.unlinkSync(dirUpload + "/"+ originalname)


        // Inserir o recurso na base de dados
        Resource.insert(resource)
        .then(data => {console.log("Recurso inserido com sucesso na base de dados");})
        .catch(err => console.error(err))
      
    })
    
}
})

console.log("Processo finalizado com sucesso!!!!")


