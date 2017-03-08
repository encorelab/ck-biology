#!/bin/bash
# run this on the server in the ck-biology directory to clean up the terms after use - for use with encore testing

# mongo ck-biology-encore --eval "db.users.remove()"
# mongoimport -d ck-biology-encore -c users --jsonArray scaffolding/encore-users.json

# mongo ck-biology-encore --eval "db.terms.remove()"
# mongoimport -d ck-biology-encore -c terms --jsonArray scaffolding/encore-terms.json

# mongo ck-biology-encore --eval "db.relationships.remove()"
# mongoimport -d ck-biology-encore -c relationships --jsonArray scaffolding/encore-relationships.json

mongo ck-biology-encore-U4 --eval "db.articles.remove()"
mongoimport -d ck-biology-encore-U4 -c articles --jsonArray scaffolding/encore-U4-articles.json

mongo ck-biology-encore-U4 --eval "db.groups.remove()"
mongoimport -d ck-biology-encore-U4 -c groups --jsonArray scaffolding/groups-unit4.json

# mongo ck-biology-encore --eval "db.reports.remove()"