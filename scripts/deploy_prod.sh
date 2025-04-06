echo $1
git checkout master
git pull origin master
yarn version --$1
git push
docker build . -t northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest  
docker push northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest  
gcloud run deploy poaa-api --image northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest   --set-env-vars "NODE_ENV=production"