const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3001; // Set a default port if process.env.PORT is not set

const app = express();

app.get('/', (req, res) => {
    res.send('running');
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
