docker container kill poaa-api
docker container remove poaa-api
docker build . -t gcr.io/seedbox-299206/poaa-api
docker run -d -p 4000:8080 --env NODE_ENV=development --name poaa-api gcr.io/seedbox-299206/poaa-api 
