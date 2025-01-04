#!/bin/sh

# Check if the Docker volume already exists
  if [ ! "$(docker volume ls -q -f name=salesense-volume)" ]; then
    docker volume create salesense-volume
    echo "Docker volume 'salesense-volume' created."
  else
    echo "Docker volume 'salesense-volume' already exists."
  fi

  # Check if the Docker volume for Postgres already exists
  if [ ! "$(docker volume ls -q -f name=postgres-data)" ]; then
    docker volume create postgres-data
    echo "Docker volume 'postgres-data' created."
  else
    echo "Docker volume 'postgres-data' already exists."
  fi
echo "Docker volume 'salesense-volume' created."

# Run the MinIO container with the volume mounted
docker run -d --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=***" \
  -e "MINIO_ROOT_PASSWORD=***" \
  -v salesense-volume:/data \
  minio/minio server /data --console-address ":9001"

echo "MinIO container started."

# Postgres container
docker run -d \
  --name postgres \
  -e POSTGRES_USER=*** \
  -e POSTGRES_PASSWORD=*** \
  -e POSTGRES_DB=salesense \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:latest
  
echo "Postgres container started."