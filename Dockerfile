FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--host", "0.0.0.0"]