FROM node:12.18.3
  
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install nodemon -g

COPY . .

ENV PORT=3000

EXPOSE 3000

RUN npm test
CMD [ "npm", "start" ]