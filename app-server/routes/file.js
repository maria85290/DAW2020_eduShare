var express = require('express');
var router = express.Router();
const axios = require('axios')
const { v4: uuidv4 } = require('uuid');
const jwt_decode = require('jwt-decode');
const  unzipper =require ('unzipper');
var path = require('path')

const utils = require('../utils.js')

const apiServer = utils.apiServer;
const authServer = utils.authServer;

const fs = require('fs');
const resources = require('../../api-server/models/resources.js');


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


/// --------------------------------------------------------------------------



// GET /file?..

router.get('/', (req, res) => {

    let id_file = req.query.id_file
    let id_post = req.query.id_post
    
    console.log(id_file)
    console.log(id_post)

    var userInfo = req.user

    axios.get(apiServer + '/search/file/' + id_file + '?token=' + req.cookies.token)
    .then(data => {
             // pedido do post que se esta a tratar
             let extension = data.data.name.split('.')[1]
             console.log(extension)
     
             if(extension.match(/(doc|docx)$/)) {
                 ext = "word text-primary"
             }
             else if (extension.match(/(xls|xlsx)$/)) {
                 ext = "excel text-success"
             }
             else if (extension.match(/(ppt|pptx)$/)){
                 ext = "powerpoint text-danger"
             }
             else if (extension.match(/(jpg|jpeg|png)$/)) {
                 ext = "image text-warning"
             }
             else if (extension.match(/(pdf)$/)) {
                 ext = "pdf text-danger"
             }
             else if (extension.match(/(zip|rar|tar|gzip|gz|7z)$/)) {
                 ext = "archive text-muted"            
             }
             else if (extension.match(/(php|js|css|htm|html)$/)){
                 ext = "code text-info"
             }
             else if (extension.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/)){
                 ext = "movie-o text-warning"
             }
             else if (extension.match(/(mp3|wav)$/)){
                 ext = "audio text-warning"
             }
             else {
                 ext = ""
             }    

             let displayFile = 0
             if (data.data.mimeType != " " && data.data.mimeType.split("/")[1].match(/(pdf|jpg|jpeg|png|ppt|pptx|plain|json|javascript|css|py|html|htm)$/)){
                displayFile = 1
             }
            
             let file = data.data
              axios.get(apiServer + '/posts/' + id_post + '?token=' + req.cookies.token)
               .then(data1 => {
                   console.log("POST " + data1.id); 
                   res.render('index', {view: "file", extension: ext, file: file, post: data1.data, displayFile: displayFile, user: userInfo, resourcesType: utils.resourceTypes})
                }) 
               .catch(e => console.log("[file] error getting the post info from the database -- " + e));
              })
    .catch(e => console.log("[file /] error searching file in the database -- " + e))
})


// get file/ranking
router.get('/ranking', (req,res) =>{
    let id_file = req.query.id
    let name_file = req.query.name

    console.log(id_file)

    res.render('index', {view: "ranking_File", user: req.user, id_file: id_file, name_file: name_file, resourcesType: utils.resourceTypes})
})




// POST /file/ranking
router.post("/ranking", (req,res)=>{

    //to know if the rating is from "My resources" ou "Resources"
    let pageResources = req.query.pageResources
    let id_file = req.query.id_file
    let name_file = req.query.name_file
    let ranking = req.body.ranking


    now = new Date
    let month = ["01","02","03","04","05","06","07", "08", "09", "10", "11", "12"]
    let day =  now.getFullYear()+ "-" + month[now.getMonth()] + "-" + now.getDate()
   

    let par = {
        id_user : req.user.mail, 
        ranking: ranking
    }

    console.log(id_file)
    axios.get(apiServer + '/search/file/' + id_file+'?token=' + req.cookies.token )
        .then(data => {
            console.log(data.data);
            let r = 0;  let i = 1; 
            if (data.data.rankingList != "[ ]" ) {
                data.data.rankingList.forEach(e => { r = e.ranking + r; i = i + 1})
            }
            r = decimalAdjust('round',parseInt(ranking,10) + parseInt(r,10),-1); 
            r =  decimalAdjust('round',parseInt(r,10) / parseInt(i,10), -1); 
            console.log("ranking:" + r) 
            
            let resource = {
                id : id_file,
                ranking : r,
                date : day,
                user_name : req.user.mail,
                rankingList : par
            }
            
            let rankingP = {
                id_file : id_file,
                ranking : r,
                date : day,
                user_name : req.user.mail,
            }
            
            let id_post = uuidv4()
            
            
            axios.post(apiServer + '/edit/file/updateRanking?token=' + req.cookies.token , {"resource": resource})
                .then(data =>
                        // cria o post do ranking
                        axios.post(apiServer + '/posts/rankingPost?token=' + req.cookies.token, {"rankingP": rankingP , "file_name" : name_file, "id_post":id_post})
                        .then(data => {

                            
                            let search = {
                                title: "",
                                author: "",
                                type: ""
                            }

                            if (pageResources == "MyResources" && req.user.level != "admin") {
                                search.author = req.user.mail
                            }
                            

                            axios.post(apiServer + '/search/files?token=' + req.cookies.token , {"search": search})
                                .then(data => {
                                    let list = data.data
                                    //list of users that uploaded each file of the list (get mail e photo)
                                    var usersList = []
                                    
                                    //fa-icon to each resource
                                    let ext = utils.mimetype2faList(list)
                                   
                                    if (pageResources == "MyResources")
                                        res.render('index', {view: "showFilesEdit", user: req.user, list: list, usersList: usersList, ext: ext, resourcesType: utils.resourceTypes})
                                    else
                                        res.render('index', {view: "showFiles", user: req.user, list: list, usersList: usersList, ext: ext, resourcesType: utils.resourceTypes})
                                })
                                .catch(e => console.log("[file] /ranking : error searching resources for search/files-- " + e))
                        })
                        .catch(e => console.log("[file] error adding post of ranking " + e)))
                        
                .catch(e => console.log("[file] error updating the resource " + e))
        })
        
            .catch(e => console.log("[file] error search the file to get the ranking list" + e))

})  
 

// POST /file/comment
router.post('/comment', (req, res) => {

    let id_post = req.query.id_post
    let id_file = req.query.id_file
    let file_name = req.query.file_name
    let comment = req.body.comment
   

    now = new Date
    let month = ["01","02","03","04","05","06","07", "08", "09", "10", "11", "12"]
    let day =  now.getFullYear()+ "-" + month[now.getMonth()] + "-" + now.getDate()

    let Comment = {
        id: uuidv4(),
        text : comment,
        user_name : req.user.mail,
        date : day
    }


    axios.post(apiServer + '/posts/comment/' + id_post + '?token=' + req.cookies.token, {"comment": Comment, "file_name":file_name, "id_file":id_file})
    .then(data => { 
        axios.post(apiServer + '/posts/commentPost?token=' + req.cookies.token, {"comment": Comment, "file_name":file_name, "id_file":id_file})
        .then(data => { 
            res.redirect("/file?id_file=" +id_file + "&id_post=" + id_post+"&user=" + req.user.mail + "&level=" + req.user.level);
        })
        .catch(e => console.log("[file] error adding post of commentary " + e))
      })
    .catch(e => console.log("[file] error adding comment" + e))
    
})
    
module.exports = router;