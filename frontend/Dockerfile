FROM node:alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci --legacy-peer-deps && \
    npm run build && \
    npm cache clean --force
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]