// --------------- server names ------------------
module.exports.apiServer = "http://localhost:7001";
module.exports.authServer = "http://localhost:7003";

// --------------- resource types and visibility ----------------

exports.resourceTypes = ['test', 'report', 'slides', 'exercises', 'others'];
exports.visibilityTypes = ['public', 'private']

module.exports.addResourceType = (newType) => {
    this.resourceTypes.push(newType)
}

// -------------- mimetype2fa --------------------

//get extension of a file to use the corresponding icon
module.exports.mimetype2fa = (mime_type)=> {
    if (mime_type==""){
        ext = " text-secondary"
    }

    if(mime_type.match(/application\/(msword|vnd.(ms-word|oasis.opendocument.text|openxmlformats-officedocument.wordprocessingml))$/)) {
        ext = "-word text-primary"
    }
    else if (mime_type.match(/application\/vnd.(ms-excel|openxmlformats-officedocument.spreadsheetml|oasis.opendocument.spreadsheet)$/)) {
        ext = "-excel text-success"
    }
    else if (mime_type.match(/application\/vnd.(ms-powerpoint|openxmlformats-officedocument.presentationml|oasis.opendocument.presentation)$/)){
        ext = "-powerpoint text-danger"
    }
    else if (mime_type.match(/application\/pdf$/)) {
        ext = "-pdf text-danger"
    }
    else if (mime_type.match(/application\/(gzip|zip)$/)) {
        ext = "-archive text-muted"            
    }
    else if (mime_type.match(/text\/plain$/)){
        ext = "-alt text-info"
    }
    else if (mime_type.match(/((application\/x-httpd-php)|(text\/x-c)|js|css|text\/(javascript|htm|html))$/)){
        ext = "-code text-info"
    }
    else if (mime_type.match(/image\/(jpeg|jpg|png)$/)) {
        ext = "-image text-warning"
    }
    else if (mime_type.match(/video$/)){
        ext = "-movie text-warning"
    }
    else if (mime_type.match(/audio$/)){
        ext = "-audio text-warning"
    }
    else {
        ext = " text-secondary"
    }        


    return ext
}

//get extension of file in a list to use the corresponding icon
module.exports.mimetype2faList = (list) => {
    let ext = []
    console.log(list)
    for(idx in list) {
        console.log(list[idx].mimeType + " " + list[idx].name)
        ext.push(this.mimetype2fa(list[idx].mimeType))
    }
    console.log("UTILS " + ext)

    return ext

}