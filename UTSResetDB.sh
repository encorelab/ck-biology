#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use

mongo ck-biology-SBI4UE-01-U1 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-01-U1 -c users --jsonArray scaffolding/SBI4UE-01-U1-users.json

mongo ck-biology-SBI4UE-01-U1 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-01-U1 -c terms --jsonArray scaffolding/SBI4UE-01-U1-terms.json

mongo ck-biology-SBI4UE-01-U1 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-01-U1 -c relationships --jsonArray scaffolding/SBI4UE-01-U1-relationships.json

mongo ck-biology-SBI4UE-01-U1 --eval "db.articles.remove()"
mongoimport -d ck-biology-SBI4UE-01-U1 -c articles --jsonArray scaffolding/SBI4UE-01-U1-articles.json

mongo ck-biology-SBI4UE-01-U1 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-01-U1 -c lessons --jsonArray scaffolding/lessons-unit1.json


mongo ck-biology-SBI4UE-02-U1 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-02-U1 -c users --jsonArray scaffolding/SBI4UE-02-U1-users.json

mongo ck-biology-SBI4UE-02-U1 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-02-U1 -c terms --jsonArray scaffolding/SBI4UE-02-U1-terms.json

mongo ck-biology-SBI4UE-02-U1 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-02-U1 -c relationships --jsonArray scaffolding/SBI4UE-02-U1-relationships.json

mongo ck-biology-SBI4UE-02-U1 --eval "db.articles.remove()"
mongoimport -d ck-biology-SBI4UE-02-U1 -c articles --jsonArray scaffolding/SBI4UE-02-U1-articles.json

mongo ck-biology-SBI4UE-02-U1 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-02-U1 -c lessons --jsonArray scaffolding/lessons-unit1.json