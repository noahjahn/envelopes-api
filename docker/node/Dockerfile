FROM node:18-alpine

# default node UID is 1000
ARG UID=1000

USER root

RUN apk --no-cache add shadow \
    && find / -group node -exec chgrp -h $UID {} \; \
    && find / -user node -exec chown -h $UID {} \; \
    && usermod -u $UID node \
    && groupmod -g $UID node \
    && apk del shadow

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node
