# build stage
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install pm2 -g
CMD ["pm2-runtime", "server.js"]