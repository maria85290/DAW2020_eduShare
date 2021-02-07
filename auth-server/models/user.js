var mongoose = require('mongoose')

var user = new mongoose.Schema({
    name: String,
    mail: String,
    password: String,
    filiation: String,
    level: String,      // consumer, admin or producer
    photo: String,
    registerDate: Date,
    lastAccessDate: Date
});

module.exports = mongoose.model('user', user)