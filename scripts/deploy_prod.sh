echo $1
yarn version --$1
git push
docker build . -t gcr.io/seedbox-299206/poaa-api
docker push gcr.io/seedbox-299206/poaa-api
gcloud run deploy poaa-api --image gcr.io/seedbox-299206/poaa-api