docker container kill poaa
docker container remove poaa
docker build . -t gcr.io/seedbox-299206/poaa-api
docker run -d -p 4000:4000 --name gcr.io/seedbox-299206/poaa-api