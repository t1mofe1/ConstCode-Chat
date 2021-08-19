FROM node:16
WORKDIR /app
USER root
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
CMD npm run prod:start