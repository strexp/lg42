FROM node:slim AS builder

WORKDIR /app

COPY . .

RUN npm install -g corepack@latest --force && \
    corepack enable && \
    corepack prepare yarn@latest --activate

RUN yarn install
RUN yarn build

FROM node:slim

WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["node", ".output/server/index.mjs"]
