echo $1
git checkout master
git pull origin master
yarn version --$1
git push
docker build . -t us-east1-docker.pkg.dev/poaa-389702/api/poaa-api:latest  
docker push us-east1-docker.pkg.dev/poaa-389702/api/poaa-api:latest  
gcloud run deploy poaa-api --image us-east1-docker.pkg.dev/poaa-389702/api/poaa-api:latest   --set-env-vars "NODE_ENV=production"