#!/bin/bash

__file_exists() {
    test -f "$1"
}

export UID

if ! __file_exists ".env"; then
    echo "Please create the .env file"
    echo "Example: "
    echo "cp .env.example .env"
    exit 1
fi

mkdir -p node_modules

docker-compose pull || exit 1
docker-compose build || exit 1
./npm install || exit 1
docker-compose up || { docker-compose down; exit 0; }
