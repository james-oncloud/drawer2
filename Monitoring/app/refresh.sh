docker image prune -a -f
docker rmi -f $(docker images | grep 'monitoring-app')
docker image ls