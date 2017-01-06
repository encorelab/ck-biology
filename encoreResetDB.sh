#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use - for use with encore testing

mongo ck-biology-encore --eval "db.users.remove()"
mongoimport -d ck-biology-encore -c users --jsonArray scaffolding/encore-users.json

mongo ck-biology-encore --eval "db.terms.remove()"
mongoimport -d ck-biology-encore -c terms --jsonArray scaffolding/encore-terms.json

mongo ck-biology-encore --eval "db.relationships.remove()"
mongoimport -d ck-biology-encore -c relationships --jsonArray scaffolding/encore-relationships.json

mongo ck-biology-encore --eval "db.articles.remove()"
mongoimport -d ck-biology-encore -c articles --jsonArray scaffolding/encore-articles.json

mongo ck-biology-encore --eval "db.groups.remove()"

mongo ck-biology-encore --eval "db.reports.remove()"