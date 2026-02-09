# ---------- Base image ----------
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# ---------- Install dependencies ----------
# Copy only dependency files first (better caching)
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

# ---------- Run app ----------
CMD ["node", "superAdminIndex.js"]
