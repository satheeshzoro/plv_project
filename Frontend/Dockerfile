# Use Node image
FROM node:20-alpine

# Set work directory
WORKDIR /app/frontend

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose React port
EXPOSE 3000

# Start the dev server
CMD ["npm", "run","dev"]