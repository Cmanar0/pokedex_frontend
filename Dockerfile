FROM node:18-bullseye

WORKDIR /app

ENV ROLLUP_USE_NODE_JS=true

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
