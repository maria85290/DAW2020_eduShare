// Ficheiro que permite backUp das entradas da base de dados.
// O conteudo que posteriormente pode ser importado para a base de dados pode ser visualizado em datasets/<database>

var exec = require('child_process').exec

 // Guarda o conteudo da base de dados no ficheiro resources
child = exec('mongoexport --db Resources --collection resources --type json --out  ./datasets/resources',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });


  // Guarda o conteudo da base de dados no ficheiro posts
child = exec('mongoexport --db Posts --collection posts --type json  --out ./datasets/posts',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });

    // Guarda o conteudo da base de dados no ficheiro users no auth-server

  child = exec('mongoexport --db users --collection users --out ./datasets/users',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });




