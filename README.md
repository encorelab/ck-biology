# ck-biology
Research tool for CK Biology 2016 run in Toronto

This repo compromises the tools needed to facilitate the brainstorming part of the CK Biology 2016 run

## Dev notes
You'll also need to npm install, bower install and create a config.json from the config.example.json

npm start to start up the node server

To import scaffolding to local Mongo, eg:

    mongoimport -d ck-biology-SBI4UE-01-U3 -c users --file scaffolding/SBI4UE-01-U3-users.json --jsonArray

    mongoimport -d ck-biology-SBI4UE-01-U3 -c terms --file scaffolding/SBI4UE-01-U3-terms.json --jsonArray
    
    mongoimport -d ck-biology-SBI4UE-01-U3 -c relationships --file scaffolding/SBI4UE-01-U3-relationships.json --jsonArray

