FROM node:lts-alpine
WORKDIR /app
RUN apk --no-cache add curl

COPY . .
RUN npm ci && npm run build && npm ci --production
CMD [ "npm", "start" ]

EXPOSE 2600
VOLUME /app/data/

HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost:3030/api/health-check || exit 1 