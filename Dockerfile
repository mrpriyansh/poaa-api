
# --- STAGE 1: Build & Dependency Resolution ---
FROM node:22-slim AS builder

WORKDIR /usr/src/app

# Install required build tools for potential native node modules
RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

# Optimize Cache: Copy ONLY lockfiles first so dependencies don't rebuild on code changes
COPY package*.json yarn.lock ./

# Install ALL dependencies (including devDependencies if needed for typescript/builds)
RUN yarn install --frozen-lockfile

# Copy source code and build step (uncomment if you use TypeScript/Vite/NextJS)
COPY . .
# RUN yarn build 

# Clean up devDependencies to keep production image small
RUN yarn install --production --frozen-lockfile --ignore-scripts


# --- STAGE 2: Lightweight Production Image ---
FROM node:22-slim AS runner

WORKDIR /usr/src/app

# Set modern environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NODE_ENV=production \
    PORT=8080

# Install ONLY runtime dependencies (Google Chrome for Puppeteer)
RUN apt-get update && apt-get install gnupg wget -y && \
	wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
	sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
	apt-get update && \
	apt-get install google-chrome-stable -y --no-install-recommends && \
	rm -rf /var/lib/apt/lists/*



# Copy node_modules and built assets directly from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/yarn.lock ./
COPY . .

EXPOSE 8080

CMD [ "yarn", "start" ]
