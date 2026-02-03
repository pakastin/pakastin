FROM node:24

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json /app/
RUN npm i

COPY public /app/public
COPY server /app/server
COPY server.js /app/server.js

EXPOSE 8080
ENTRYPOINT ["node", "server.js"]
