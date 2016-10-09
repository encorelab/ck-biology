#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use - for use with encore testing

mongo ck-biology-encore --eval "db.users.remove()"
mongoimport -d ck-biology-encore -c users --jsonArray scaffolding/pupils-encore.json

mongo ck-biology-encore --eval "db.terms.remove()"
mongoimport -d ck-biology-encore -c terms --jsonArray scaffolding/terms-encore.json

mongo ck-biology-encore --eval "db.relationships.remove()"
mongoimport -d ck-biology-encore -c relationships --jsonArray scaffolding/relationships-encore.json

mongo ck-biology-encore --eval "db.articles.remove()"
mongoimport -d ck-biology-encore -c articles --jsonArray scaffolding/articles-encore.json

mongo ck-biology-encore --eval "db.lessons.remove()"
mongoimport -d ck-biology-encore -c lessons --jsonArray scaffolding/lessons-unit1.json