// Ficheiro que permite popular as bases de dados.

var exec = require('child_process').exec

 // Guarda o conteudo da base de dados no ficheiro resources
child = exec('mongoimport --db Resources --collection resources --type json ./datasets/resources',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });


  // Guarda o conteudo da base de dados no ficheiro posts
child = exec('mongoimport --db Posts --collection posts --type json  ./datasets/posts',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });

    // Guarda o conteudo da base de dados no ficheiro users no auth-server

  child = exec('mongoimport --db users --collection users ./datasets/users',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });



