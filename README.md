# ck-biology
Research tool for CK Biology 2016 run in Toronto

This repo compromises the tools needed to facilitate the brainstorming part of the CK Biology 2016 run

## Dev notes
To import scaffolding to local Mongo, eg:

    mongoimport -d wallcology2015-ben -c users --jsonArray scaffolding/pupils-ben.json

    mongoimport -d wallcology2015-ben -c states --jsonArray scaffolding/state.json

You'll also need to npm install, bower install and create a config.json from the config.example.json

npm start to start up the node server
