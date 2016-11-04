# ck-biology
Research tool for CK Biology 2016 run in Toronto

This repo compromises the tools needed to facilitate the brainstorming part of the CK Biology 2016 run

## Dev notes
You'll also need to npm install, bower install and create a config.json from the config.example.json

npm start to start up the node server

To import scaffolding to local Mongo, eg:

    mongoimport -d ck-biology-maria1 -c users --jsonArray scaffolding/pupils-maria1.json

    mongoimport -d ck-biology-maria1 -c states --jsonArray scaffolding/state.json
