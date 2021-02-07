
var express = require('express');
var router = express.Router();
const axios = require('axios')

const { v4: uuidv4 } = require('uuid');
const jwt_decode = require('jwt-decode');

const utils = require('../utils.js');


router.get('/', (req,res) =>{
    let user = req.user
    axios.get('http://localhost:7003/users/consult?token=' + req.cookies.token)
    .then(dados =>  {console.log("numero de dados" + dados.data.length);
                let users = dados.data;   // dados de todos os utilizadores

                axios.get('http://localhost:7001/edit/allFiles?token=' + req.cookies.token)
                        .then(dados =>  {let resources = dados.data; 
                        res.render('index', {view: "statistics", user: user, usersLength: users.length,users:users, resources: resources, resourcesLength: resources.length, resourcesType: utils.resourceTypes })})
                        .catch(e => console.log("erro ao ir buscar todos os recusrsos a base de dados" + e))
                })
    .catch(e => console.log("erro ao consultar" + e))
})

module.exports = router;