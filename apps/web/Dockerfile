FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docflow-web-entrypoint
RUN chmod +x /usr/local/bin/docflow-web-entrypoint

EXPOSE 5173

ENTRYPOINT ["/usr/local/bin/docflow-web-entrypoint"]
