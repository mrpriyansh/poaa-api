echo $1
git checkout master
git pull origin master
yarn version --$1
git push
docker build . -t gcr.io/seedbox-299206/poaa-api
docker push gcr.io/seedbox-299206/poaa-api
gcloud run deploy poaa-api --image gcr.io/seedbox-299206/poaa-api --set-env-vars "NODE_ENV=production"