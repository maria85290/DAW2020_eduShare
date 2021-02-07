# DAW_Project

Api-server -> porta 7001

App-server -> porta 7002

Auth-server -> porta 7003

Para iniciar a app: **localhost:7002**

### Executar todos os servidores

na diretoria app server: npm run all


### Upload de multiplos ficheiros via API

Colocar os ficheiros que se pretende fazer upload na pasta api-server/UploadsApi
Executar no terminal: node resourcesGenerator.js
Todos os ficheiros que estava na pasta UploadsApi são convertidos para formato bagit e zipados. 
É adicionada uma entrada na base de dados para cada um deles. 
E adicionado uma entrada na base de dados Posts para cada um dos ficheiros que for inserido como "public".

## Popular base de dados
Para popular a base de dados incialmente fazer deve-se eliminar as bases de dados preexistentes (com o drop()).
Na diretoria inicial: Daw_project:

node populate.js

## Fazer download da pasta filestore e colocar no API-SERVER:
Este passo é necessario por a filestore ter sido adiconada ao gitignore


## BackBase de dados 
Para fazer um backup dos dados na base de dados e utilizar posteriormente para popular base de dados deve-se executar na diretoria princial:

node backup.js 

(e são criados os ficheiros users, resources e posts com o conteudo das bases de dados. Estes ficheiros podem ser consultados na diretoria datasets)


# Upload de ficheiros via APP ( interface)

Na rota http://localhost:7002/uploads , é possivel fazer upload de ficheiros simples e pastas Zipadas.
