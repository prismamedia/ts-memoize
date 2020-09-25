FROM node:12
LABEL maintainer="Yvann Boucher <yvann.boucher@gmail.com>"

RUN yarn set version berry

RUN set -x \
  && node -v \
  && yarn -v
