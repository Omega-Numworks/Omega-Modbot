# Use node lts
FROM node:lts-alpine

# Set working directory
WORKDIR /seb-bot/

RUN apk add --no-cache libtool make autoconf automake alpine-sdk python3

# Install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# Build
COPY . ./
RUN yarn build

CMD node dist/index.js
