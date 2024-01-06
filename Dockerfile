FROM node:current-alpine3.18 AS base
LABEL authors="nicholas5538"
LABEL version="1.0"

COPY . /app
WORKDIR /app

# Install pnpm
RUN yarn global add pnpm

# Install dependencies
FROM base AS dev
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile

EXPOSE 3500
ENV PORT 3500
ENV HOSTNAME "0.0.0.0"

CMD ["pnpm", "run", "dev"]

FROM base as prod-dev
RUN npm pkg delete scripts.prepare
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --prod --frozen-lockfile

FROM base AS build
COPY --from=prod-dev /app/node_modules ./node_modules
RUN pnpm run build:prod

FROM base AS prod
ENV NODE_ENV production
EXPOSE 4500

RUN deluser --remove-home node \
  && addgroup -S node --gid 1001 \
  && adduser -S -g node -u 1001 node \
  && chown -R node:node .

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/run-main.js run-main.js

USER node

CMD ["node", "run-main.js"]