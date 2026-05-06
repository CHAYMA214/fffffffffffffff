FROM node:20
WORKDIR /usr/src/app
ENV node_ENV=production 
COPY package*.json ./
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci --omit=dev --legacy-peer-deps
COPY --chown=node:node . .
EXPOSE 3000
CMD ["npm", "start"]