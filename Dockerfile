FROM node:12.18.3

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app
COPY package.json $HOME/
RUN chown -R app:app $HOME/*

USER root
WORKDIR $HOME
RUN npm install -g nodemon
RUN npm install