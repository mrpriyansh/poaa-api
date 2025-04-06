docker container kill poaa-api
docker container remove poaa-api
docker build . -t northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest
docker run -d -p 4000:8080 --env NODE_ENV=development --name poaa-api northamerica-northeast1-docker.pkg.dev/poaa-389702/api/poaa-api:latest
