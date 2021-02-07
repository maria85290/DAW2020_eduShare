var mongoose = require('mongoose')

const resources = mongoose.connection.useDb('Resources')


var resourceSchema = new mongoose.Schema({
    id :  String,
    title:String,
    name:String,
    subtitle:String,
    mimeType:String,
    size:String,
    id_produces: String,
    authors:[String],
    dateLastUpdate: String,
    timeLastUpdate: String,
    type : String,
    subject : String,
    description: String,
    id_post:String,
    rankingList: [ { id_user : String , ranking : Number}],
    ranking: Number,
    visibility:String,
    hashtags: [String]
});


module.exports =  resources.model ('resource',  resourceSchema)