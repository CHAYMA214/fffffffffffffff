FROM node:20

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

# Install only production dependencies and ignore peer conflicts
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci --only=production --legacy-peer-deps

# Set user
USER node

# Copy the app source code
COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "app.js"]
#kckcjskj