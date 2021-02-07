// Ferramenta de procura.
// Funciona como filtro

const fs = require('fs')
const express = require('express')
var router = express.Router();
const multer = require('multer')

var Resource = require('../controllers/resource')


// GET /file/id

//Vai buscar um dado elemento
router.get('/file/:id', (req,res) =>{
    console.log(req.params.id)
    
    Resource.lookUp(req.params.id)
    .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
    .catch(e => res.status(500).jsonp({err: e}))
    
})

//get top 10 starred resources
router.get('/mostStarred', (req, res) => {
    Resource.listMostStarred()
    .then(data => res.status(201).json(data))
    .catch(e => res.status(500).jsonp({err: e}))  
})

//get resources with an hashtag
router.get('/:hashtag', (req,res) =>{
    Resource.listHashtag(req.params.hashtag)
    .then(data => {console.log("[search] /hashtag -- getting resources with the hashtag + " + req.params.hashtag); res.status(201).json(data)})
    .catch(e => res.status(500).jsonp({err: e}))
    
})

// Post /search/files
router.post('/files', (req, res) => {

    console.log(req.body.search)
    
    if (req.body.search){
        let search = req.body.search

        if(search.hashtag) {
            Resource.listHashtag(search.hashtag)
            .then(data => {console.log("[search] getting resources with the hashtag " + search.hashtag + " -- " + data); res.status(201).json(data)})
            .catch(e => res.status(500).jsonp({err: e}))
        }
        else {
            if (search.type!=""  && search.title!="" && search.author!=""){
                Resource.listSearch(search.type, search.author, search.title)
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
            if (search.type!="" && search.title!=""){

                Resource.listTypeTitle(search.type, search.title)
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
            if (search.type!="" && search.author!=""){

                Resource.listTypeAuthor(search.type, search.author)
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
            if (search.title!="" && search.author!=""){
   
                Resource.listTitleAuthor(search.author, search.title)
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
            if (search.type!=""){
                let type = search.type

                console.log("type " + type)

                Resource.listType(type)
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
            if (search.author!=""){

                let author = search.author

                console.log("author " + author)

                Resource.listAuthor(author)
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
            if (search.title!=""){
                let title = search.title

                console.log("title " + title)

                Resource.listTitle(title)
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
        

            // Se nenhum dos parametros for passado ele vai apresentar todos
            if (search.title=="" & search.author=="" & search.type==""){
                Resource.listAll()
                .then(data => {console.log("DATA SEARCH haha" + data); res.status(201).json(data)})
                .catch(e => res.status(500).jsonp({err: e}))
            }
        }
    }
    
        
})

// Post /search/files
router.post('/files/:userID', (req, res) => {
    Resource.listProducer(req.params.userID)
    .then(data => {console.log("data: " + data); res.status(201).json(data)})
    .catch(e => res.status(500).jsonp({err: e}))

        
})



module.exports = router;