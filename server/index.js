const express = require('express');
const dotenv = require('dotenv');
//const chats = require('./data/data');
const cors = require("cors");
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')

// Load environment variables from .env file
dotenv.config();

connectDB();

const PORT = process.env.PORT || 3001; // Set a default port if process.env.PORT is not set

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('running');
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});