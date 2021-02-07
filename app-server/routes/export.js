
var express = require('express');
var router = express.Router();
const axios = require('axios')
var BagIt = require('bagit-fs')
var path = require('path')
const fs = require('fs')
const zipFolder = require('zip-a-folder');


// Rota responsavel por atualizar o bagit-info com os dados associados ao recurso
// Fazer download da pasta zipada
router.get('/:id', (req,res) =>{

    if (req.user.level == "admin"){
        
    
    // Limpar o conteudo anterior da pasta ViewFile
    const dir = path.join (__dirname, "../../api-server/viewFile")

   // fs.rmdirSync(dir + "/data", { recursive: true });
    fs.readdir('./../api-server/viewFile',function(err,files){
        if (err) {
            console.log(err); 
          }
      
         else { 
            files.forEach(originalname => {
             fs.unlinkSync(dir + "/" + originalname) 
           })
         }
    })
    let id = req.params.id 
    const dirfile = path.join (__dirname, "../../api-server/fileStore/" + req.query.type + "/" + id)
    const dirbag = path.join (__dirname, "../../api-server/viewFile/"+ id)

    // Fazer pedido do recurso a  base de dados 


    axios.get('http://localhost:7001/search/file/' + id + "?token=" + req.cookies.token)
        .then(resource => {console.log("DATA EDIT HEY" + resource.data);

                        

                        // Fazer pedidos dos posts associados ao recurso na base de dados
                        axios.get('http://localhost:7001/posts/file/' + id + "?token=" + req.cookies.token)
                        .then(data => { 
                           
                            let r = resource.data 
                            r.posts = []
                            data.data.forEach(p => {
                                console.log("ola")
                                
                                let post = {
                                    id: p.id,
                                    name_file:p.name_file,
                                    description: p.description,
                                    id_file: p.id_file,
                                    date: p.date,
                                    time: p.time,
                                    user_name:p.user_name,
                                    postType:p.postType,
                                    comments: p.comments
                                  }
                                
                                
                                r.posts.push(post)
    
                            })
                

                            let bag = BagIt(dirbag, 'sha256', r )

                            fs.createReadStream("../api-server/fileStore/" + req.query.type + "/" + id + "/data/" + req.query.name ).pipe(bag.createWriteStream( "/"+req.query.name))
                            

                            bag.finalize(function (err) {
                                if (err) return console.err(err)
                                else{
                                    console.log('bag finalized')
                                    fs.unlinkSync(dirbag + "/bag-info.txt" ) 
                                   
                                    var dict = JSON.stringify(r);
                                    fs.writeFile("../api-server/viewFile/" + id +"/bag.json", dict, function(err, result) {
                                        if(err) console.log('error', err)
                                    
                                    else{
                                        res.redirect("/search/download/file?token=" + req.cookies.token+ "&type="+r.type+ "&name="+r.name + "&id=" + r.id  + "&export=sim")
                                    }
                                })
                                }
                            })
                         
                    }).catch(e => console.log("erro ao pesquisar posts de um dado recurso" + e))


})
.catch(e => console.log("erro ao pesquisar o  recurso" + e))
}



else{
    res.status(401).jsonp({erro:"You are not authorized to perform this operation"})
}

})
module.exports = router;