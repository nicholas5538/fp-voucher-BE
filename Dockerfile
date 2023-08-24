FROM node:20-bookworm-slim AS base
LABEL authors="nicholas5538"
LABEL version="1.0"

# Install pnpm
RUN npm install -g pnpm

# Copy the application files
COPY . /app/

# Set the working directory
WORKDIR /app

# Install dependencies
FROM base AS development
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
EXPOSE 3500
CMD [ "pnpm", "run", "dev" ]

FROM base AS production
RUN npm pkg delete scripts.prepare
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpm run build

FROM base AS test
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
CMD [ "pnpm", "run", "test" ]

FROM base
COPY --from=production /app/node_modules /app/node_modules
EXPOSE 3500
CMD [ "pnpm", "start" ]