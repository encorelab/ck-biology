#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use

mongo ck-biology-SBI4UE-01-U4 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-01-U4 -c users --jsonArray scaffolding/SBI4UE-01-U4-users.json

mongo ck-biology-SBI4UE-01-U4 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-01-U4 -c lessons --jsonArray scaffolding/lessons-unit4.json

mongo ck-biology-SBI4UE-01-U4 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-01-U4 -c terms --jsonArray scaffolding/SBI4UE-01-U4-terms.json

mongo ck-biology-SBI4UE-01-U4 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-01-U4 -c relationships --jsonArray scaffolding/SBI4UE-01-U4-relationships.json

# mongo ck-biology-SBI4UE-01-U4 --eval "db.articles.remove()"
# mongoimport -d ck-biology-SBI4UE-01-U4 -c articles --jsonArray scaffolding/SBI4UE-01-U4-articles.json

# mongo ck-biology-SBI4UE-01-U4 --eval "db.groups.remove()"

# mongo ck-biology-SBI4UE-01-U4 --eval "db.reports.remove()"

mongo ck-biology-SBI4UE-02-U4 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-02-U4 -c users --jsonArray scaffolding/SBI4UE-02-U4-users.json

mongo ck-biology-SBI4UE-02-U4 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-02-U4 -c lessons --jsonArray scaffolding/lessons-unit4.json

mongo ck-biology-SBI4UE-02-U4 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-02-U4 -c terms --jsonArray scaffolding/SBI4UE-02-U4-terms.json

mongo ck-biology-SBI4UE-02-U4 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-02-U4 -c relationships --jsonArray scaffolding/SBI4UE-02-U4-relationships.json

# mongo ck-biology-SBI4UE-02-U4 --eval "db.articles.remove()"
# mongoimport -d ck-biology-SBI4UE-02-U4 -c articles --jsonArray scaffolding/SBI4UE-02-U4-articles.json

# mongo ck-biology-SBI4UE-02-U4 --eval "db.groups.remove()"

# mongo ck-biology-SBI4UE-02-U4 --eval "db.reports.remove()"

# echo "Disabled..."
