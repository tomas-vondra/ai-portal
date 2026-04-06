FROM node:22-alpine AS builder

WORKDIR /app
COPY shared/ ./shared/
COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ ./
RUN npx tsc

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/shared ./shared

EXPOSE 3001
CMD ["node", "dist/server.js"]
