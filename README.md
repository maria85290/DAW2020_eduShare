# DAW_Project - eduShare

### Para correr a aplicação:
1.  Instalar os módulos necessarios: nas directorias api-server, app-server, auth-server executar **npm i**
2.  Povoar as bases de dados:  na directoria principal, DAW2020_eduShare, executar **node populate.js**
3.  Iniciar os servidores:  na diretoria app-server executar **npm run all**

Aplicação a correr em: http://localhost:7002

### Upload de múltiplos ficheiros via API

Colocar os ficheiros que se pretendem fazer upload na pasta api-server/UploadsApi e executar **node resourcesGenerator.js**.
Todos os ficheiros que estava na pasta UploadsApi são convertidos para formato bagit e zipados. 
É adicionada uma entrada na base de dados para cada um deles e adicionada uma entrada na base de dados Posts para cada um dos ficheiros que for inserido como "public".


### Upload de ficheiros via APP ( interface)
Na rota http://localhost:7002/uploads, é possivel fazer upload de ficheiros simples e pastas Zipadas.
