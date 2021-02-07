var mongoose = require('mongoose')


const posts = mongoose.connection.useDb('Posts')



var commentSchema = new mongoose.Schema({
    text : String,
    user_name : String,
    date : String,
    id:String
   
})


var postSchema = new mongoose.Schema({
    id: String,
    id_file:String,
    name_file:String,
    description: String,
    date: String,
    time:String,
    user_name:String,
    postType:String, // file, comment, share, ranking
    comments: [commentSchema]
   
})


module.exports =  posts.model ('post', postSchema)