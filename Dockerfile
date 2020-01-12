FROM node:13.6-alpine

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY . .

RUN mkdir /data
ENV DATA_DIR /data
CMD [ "node", "src/index.js" ]
