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

FROM base as prod-dev
RUN npm pkg delete scripts.prepare
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --prod --frozen-lockfile

FROM base AS build
COPY --from=prod-dev /app/node_modules ./node_modules
RUN pnpm run build:prod

FROM base AS prod
ENV NODE_ENV production
EXPOSE 3500

RUN chown -R node:node .

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/run-main.js run-main.js

USER node

CMD ["node", "run-main.js"]