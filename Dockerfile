FROM node:10-alpine

WORKDIR /app

COPY ./ /app

EXPOSE 8080 

CMD [ "node", "producer.js" ]