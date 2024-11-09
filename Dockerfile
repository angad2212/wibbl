# Use an official Node.js image as the base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port that your backend server runs on
EXPOSE 5001

# Start the backend server
CMD ["node", "index.js"]


#after making changes:
    #remove the running container:
        #docker ps -a  # List all containers to find the container ID
        #docker stop <container_id>  # Stop the container
        #docker rm <container_id>  # Remove the stopped container

#then run teh new container:
    #docker run -p 5000:5000 wibbl-backend
