# 493-assignment5-advanced-rest

To deploy to GCloud from local WSL env
 - gcloud init
 - gcloud app deploy

To run this codebase on your localhost, ensure to set DB permissions locally. Must be done for each terminal session. This allows you to run locally, and talk to the gcloud database
 - export GOOGLE_APPLICATION_CREDENTIALS="KEY_PATH"

 keypath is the path & filename of the JSON file from GCloud that authenticates the service account
 see: https://cloud.google.com/docs/authentication/getting-started
 our key_path file: "a4-intermediate-rest-api-google-cloud-key.json"

command: export GOOGLE_APPLICATION_CREDENTIALS="a4-intermediate-rest-api-google-cloud-key.json"

Uses Node.js v14x
 - nvm use 14
