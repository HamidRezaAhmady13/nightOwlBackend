FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
COPY .env.production .env.production 
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm install --omit=dev --legacy-peer-deps
EXPOSE 3000
CMD ["npm", "start"]