const express = require('express');
const dotenv = require('dotenv');
const chats = require('./data/data');
const cors = require("cors");
const connectDB = require('./config/db')

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

app.get('/api/chats', (req,res)=>{
    res.send(chats);
})

app.get('/api/chats/:id', (req, res) => {
    const singleChat = chats.find((c) => c._id === req.params.id); // Convert the string ID to a number
    res.send(singleChat);
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
