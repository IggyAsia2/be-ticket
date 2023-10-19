FROM node:14-alpine

WORKDIR /app

COPY ["package.json", "./"]

RUN npm install

COPY . .

RUN addgroup -g 1001 appgroup
RUN adduser -D -u 1001 appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

CMD ["npm", "run", "dev"]