FROM node:22-alpine

RUN apk add --no-cache graphicsmagick curl
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD [ "npm", "start" ]

EXPOSE 2600
VOLUME /app/data/

HEALTHCHECK CMD curl "--fail" "http://localhost:2600"