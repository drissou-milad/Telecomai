FROM node:20-slim

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend source and build it
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
