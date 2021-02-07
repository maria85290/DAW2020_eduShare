var Resource = require('../models/resources')


// Returns list resources by type
module.exports.listType = (tipo)=> {
    return Resource
        .find({type:tipo,visibility:"public" })
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

// Returns list resources by author 1
module.exports.listAuthor = (author)=> {
    return Resource
        .find({authors:{ $regex: author, $options:'i'},visibility:"public"})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

// Returns list resources by author owner - all resources from a user to present in the profile page
module.exports.listAuthor2 = (author, visib)=> {
    return Resource
        .find({author:{ $regex:author},visibility: visib})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

// Returns list resources by author 1
module.exports.listTitleAuthor = (author, title)=> {
    return Resource
        .find({authors:{ $regex: author, $options:'i'}, title:{ $regex: title, $options:'i'},visibility:"public"})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

// Returns list resources by author 1
module.exports.listTypeAuthor = (type, author)=> {
    return Resource
        .find({authors:{ $regex: author, $options:'i'}, type:{ $regex: type, $options:'i'},visibility:"public"})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

// Returns list resources by author 1
module.exports.listTypeTitle = (type, title)=> {
    return Resource
        .find({title:{ $regex: title, $options:'i'}, type:{ $regex: type, $options:'i'},visibility:"public"})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

// Returns list resources by author 1
module.exports.listSearch = (type, author, title)=> {
    return Resource
        .find({authors:{ $regex: author, $options:'i'}, type:{ $regex: type, $options:'i'}, title:{ $regex: title, $options:'i'},visibility:"public"})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

//list resources by title
module.exports.listTitle = (t)=> {
    return Resource
        .find({title: { $regex: t, $options:'i'},visibility:"public"})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

//list resources by id_producer
module.exports.listProducer = (id)=> {
    return Resource
        .find({id_produces: id})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

//list resources which have a certain hashtag
module.exports.listHashtag = (hashtag)=> {
    return Resource
        .find({hashtags: {$in: [hashtag]}})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}


// Returns list all public resources
module.exports.listAll = ()=> {
    return Resource
        .find({visibility:"public"})
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}



// Returns list all resources
module.exports.list = ()=> {
    return Resource
        .find()
        .sort({dateLastUpdate: -1, timeLastUpdate:-1})
        .exec()
}

//List the 1o most starred resources
module.exports.listMostStarred = ()=> {
    return Resource
        .find({visibility: "public"})
        .sort({ranking: -1})
        .limit(10)
        .exec()
}

// Encontra um File pelo id
module.exports.lookUp = id => {
    return Resource
        .findOne({id:id})
        .exec()
}


//insere um novo recurso se nao existe
module.exports.insert = resource => {
    var newResource = new Resource (resource)
    return newResource.save()
}

//insere um novo recurso se nao existe. Se exitir faz update
module.exports.insert_update = resource => {
    return Resource.updateOne({ id: resource.id },{ id: resource.id, authors: resource.authors, name:resource.name, hashtags: resource.hashtags, title:resource.title, subject:resource.subject, description:resource.description, type:resource.type, visibility:resource.visibility, dateLastUpdate:resource.dateLastUpdate, timeLastUpdate:resource.timeLastUpdate, id_produces:resource.id_produces, ranking:resource.ranking, rankingList:resource.rankingList, size:resource.size, mimeType:resource.mimeType, subtitle: resource.subtitle },{ upsert : true } );
}
// Atualiza um recurso colocando um comentario
module.exports.insertComment = (id,comment) => {
    return Resource.updateOne ({ id: id },{post:comment});
};



// Atualiza os dados de um recurso
module.exports.update = resource => {
    console.log(resource)
    return Resource.updateOne({ id: resource.id },{$set: {authors: resource.authors, name:resource.name, title:resource.title, subject:resource.subject, description:resource.description, type:resource.type, visibility:resource.visibility, date:resource.dateLastUpdate, hashtags: resource.hashtags }});
};


module.exports.updateRanking = (resource) => {
    console.log("adding ranking to " + resource.id)
    console.dir(resource)
    return Resource.updateOne({id: resource.id}, {ranking: resource.ranking, $push: { rankingList : resource.rankingList}}).exec()
}

// apaga um recurso dado o seu ID
module.exports.delete = id => {
    console.log("Estou a eliminar")
    return Resource.deleteOne({ id: id });
};
