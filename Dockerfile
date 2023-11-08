FROM node:20-slim
WORKDIR /app
COPY . .
RUN yarn
CMD ["yarn", "dev"]
