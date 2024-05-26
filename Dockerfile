FROM node:22-alpine

RUN apk add --no-cache graphicsmagick curl python3 build-base
WORKDIR /app
COPY . .
RUN npm run build
CMD [ "npm", "start" ]

EXPOSE 2600

HEALTHCHECK CMD curl "--fail" "http://localhost:2600"