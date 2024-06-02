FROM node:22-alpine
WORKDIR /app

COPY . .
RUN npm ci && npm run build && npm ci --production
CMD [ "npm", "start" ]

EXPOSE 2600
VOLUME /app/data/

USER wikinarau:wikinarau

HEALTHCHECK CMD node -e "fetch('http://localhost:2600')"