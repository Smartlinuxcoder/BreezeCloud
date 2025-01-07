FROM oven/bun:latest as builder

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:latest

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN bun install --production

EXPOSE 3000

CMD ["bun", "./build"]
