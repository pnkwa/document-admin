FROM node:22-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG PNPM_VERSION=10.4.1

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable pnpm && corepack use pnpm@${PNPM_VERSION} && pnpm i --frozen-lockfile;

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

# config ENV here
ARG API_BASE_URL
ARG CLIENT_BASE_URL

ENV API_BASE_URL=${API_BASE_URL}
ENV CLIENT_BASE_URL=${CLIENT_BASE_URL}

RUN corepack enable pnpm && corepack use pnpm@${PNPM_VERSION}
RUN pnpm generate


# Production image, copy all the files and run next
FROM nginx:stable-alpine

ENV NODE_ENV='production'

COPY  --from=builder /app/.output/public /usr/share/nginx/html/
COPY  --from=builder /app/deployments/nginx /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


