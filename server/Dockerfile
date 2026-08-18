FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS dev
COPY . .
RUN npm run prisma:generate
EXPOSE 4310
CMD ["npm", "run", "dev:server"]

FROM deps AS prod
COPY . .
RUN npm run prisma:generate
RUN npm run server:build

FROM base AS runtime
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=prod /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=prod /app/node_modules/@prisma/client /app/node_modules/@prisma/client
COPY --from=prod /app/server-dist ./server-dist
EXPOSE 4310
CMD ["node", "server-dist/index.js"]
