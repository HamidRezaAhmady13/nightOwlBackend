# # Use Node.js base image
# FROM node:18

# # Set working directory
# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy the rest of your code
# COPY . .

# # Expose the port your app runs on
# EXPOSE 3000

# # Start the app in dev mode
# CMD ["npm", "run", "start:dev"]
