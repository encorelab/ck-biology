#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use

mongo ck-biology-SBI4UE-01-U5 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-01-U5 -c users --jsonArray scaffolding/SBI4UE-01-U5-users.json

mongo ck-biology-SBI4UE-01-U5 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-01-U5 -c lessons --jsonArray scaffolding/lessons-unit5.json

mongo ck-biology-SBI4UE-01-U5 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-01-U5 -c terms --jsonArray scaffolding/SBI4UE-01-U5-terms-pos.json

mongo ck-biology-SBI4UE-01-U5 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-01-U5 -c relationships --jsonArray scaffolding/SBI4UE-01-U5-relationships.json

mongo ck-biology-SBI4UE-01-U5 --eval "db.articles.remove()"

# mongo ck-biology-SBI4UE-01-U4 --eval "db.groups.remove()"

# mongo ck-biology-SBI4UE-01-U4 --eval "db.reports.remove()"

mongo ck-biology-SBI4UE-02-U5 --eval "db.users.remove()"
mongoimport -d ck-biology-SBI4UE-02-U5 -c users --jsonArray scaffolding/SBI4UE-02-U5-users.json

mongo ck-biology-SBI4UE-02-U5 --eval "db.lessons.remove()"
mongoimport -d ck-biology-SBI4UE-02-U5 -c lessons --jsonArray scaffolding/lessons-unit5.json

mongo ck-biology-SBI4UE-02-U5 --eval "db.terms.remove()"
mongoimport -d ck-biology-SBI4UE-02-U5 -c terms --jsonArray scaffolding/SBI4UE-02-U5-terms-pos.json

mongo ck-biology-SBI4UE-02-U5 --eval "db.relationships.remove()"
mongoimport -d ck-biology-SBI4UE-02-U5 -c relationships --jsonArray scaffolding/SBI4UE-02-U5-relationships.json

mongo ck-biology-SBI4UE-02-U5 --eval "db.articles.remove()"

# mongo ck-biology-SBI4UE-02-U4 --eval "db.groups.remove()"

# mongo ck-biology-SBI4UE-02-U4 --eval "db.reports.remove()"

# mongoimport -d ck-biology-SBI4UE-01-U4 -c articles --jsonArray scaffolding/encore-U4-articles.json
# mongo ck-biology-SBI4UE-02-U4 --eval "db.articles.remove()"
# mongoimport -d ck-biology-SBI4UE-02-U4 -c articles --jsonArray scaffolding/encore-U4-articles.json

# mongoimport -d ck-biology-SBI4UE-01-U4 -c groups --jsonArray scaffolding/groups-unit4.json
# mongo ck-biology-SBI4UE-02-U4 --eval "db.groups.remove()"
# mongoimport -d ck-biology-SBI4UE-02-U4 -c groups --jsonArray scaffolding/groups-unit4.json

#echo "Disabled..."
