FROM node:12

WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production

COPY . .

ENV PORT=3001
EXPOSE $PORT
ENTRYPOINT [ "node", "index.js" ]
