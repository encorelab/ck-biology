#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use

mongo ck-biology-maria1 --eval "db.terms.remove()"
mongoimport -d ck-biology-maria1 -c terms --jsonArray scaffolding/terms.json

mongo ck-biology-maria1 --eval "db.relationships.remove()"
mongoimport -d ck-biology-maria1 -c relationships --jsonArray scaffolding/relationships.json