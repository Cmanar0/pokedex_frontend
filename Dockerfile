FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV npm_config_optional=false
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npx", "vite", "--host"]
