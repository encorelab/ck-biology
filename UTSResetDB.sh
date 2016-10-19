#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use

mongo ck-biology-SBI4UE-01-U2 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-01-U2 -c users --jsonArray scaffolding/SBI4UE-01-U2-users.json

mongo ck-biology-SBI4UE-01-U2 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-01-U2 -c terms --jsonArray scaffolding/SBI4UE-01-U2-terms.json

mongo ck-biology-SBI4UE-01-U2 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-01-U2 -c relationships --jsonArray scaffolding/SBI4UE-01-U2-relationships.json

#mongo ck-biology-SBI4UE-01-U2 --eval "db.articles.remove()"
#mongoimport -d ck-biology-SBI4UE-01-U2 -c articles --jsonArray scaffolding/SBI4UE-01-U2-articles.json

mongo ck-biology-SBI4UE-01-U2 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-01-U2 -c lessons --jsonArray scaffolding/lessons-unit1.json


mongo ck-biology-SBI4UE-02-U2 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-02-U2 -c users --jsonArray scaffolding/SBI4UE-02-U2-users.json

mongo ck-biology-SBI4UE-02-U2 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-02-U2 -c terms --jsonArray scaffolding/SBI4UE-02-U2-terms.json

mongo ck-biology-SBI4UE-02-U2 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-02-U2 -c relationships --jsonArray scaffolding/SBI4UE-02-U2-relationships.json

#mongo ck-biology-SBI4UE-02-U2 --eval "db.articles.remove()"
#mongoimport -d ck-biology-SBI4UE-02-U2 -c articles --jsonArray scaffolding/SBI4UE-02-U2-articles.json

mongo ck-biology-SBI4UE-02-U2 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-02-U2 -c lessons --jsonArray scaffolding/lessons-unit1.json