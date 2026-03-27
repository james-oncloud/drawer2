`kibana:latest` still fails for the same reason: Docker is looking in Docker Hub at `docker.io/library/kibana:latest`, but Kibana’s official image is typically pulled from Elastic’s registry, not the default Docker Hub library namespace.

Use:

```bash
docker run -d \
  --name kibana \
  --net somenetwork \
  -p 5601:5601 \
  -e ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
  docker.elastic.co/kibana/kibana:8.13.4
```

And Elasticsearch should usually be running first on the same network:

```bash
docker run -d \
  --name elasticsearch \
  --net somenetwork \
  -p 9200:9200 \
  -e discovery.type=single-node \
  -e xpack.security.enabled=false \
  -e ES_JAVA_OPTS="-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.13.4
```

Why your command fails:
- `kibana:latest` means “pull `library/kibana` from Docker Hub”.
- There is no official `library/kibana` image there.
- You need the full image path: `docker.elastic.co/kibana/kibana:<version>`.

From your guide, the correct image is already documented here:

```90:97:Springboot/local_kibana_grafana_setup.md
  kibana:
    image: docker.elastic.co/kibana/kibana:8.13.4
    container_name: kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

If `somenetwork` does not exist yet, create it first:

```bash
docker network create somenetwork
```

Then:
1. Start Elasticsearch
2. Start Kibana
3. Open [http://localhost:5601](http://localhost:5601)

If you want, I can give you a single Docker Compose file that runs Elasticsearch + Kibana correctly.