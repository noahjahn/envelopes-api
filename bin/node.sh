#!/bin/bash

export UID
docker compose run --rm --entrypoint=node node $@
