FROM node:alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci --legacy-peer-deps && npm prune --production --legacy-peer-deps && npm cache clean --force
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "app.js"]