FROM oven/bun:latest as builder

WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:latest

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN bun install --production

EXPOSE 3000

CMD ["bun", "./build"]