const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
} = require('../controllers/chatControllers');
const Chat = require('../models/chatModel');
const mongoose = require('mongoose'); // Import mongoose


const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);

// Get chat between two users
router.get('/:userId1/:userId2', async (req, res) => {
    const { userId1, userId2 } = req.params;

    // Validate the input
    if (!userId1 || !userId2) {
        return res.status(400).json({ message: 'User IDs are required.' });
    }

    // Check if the user IDs are valid ObjectIDs
    if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
        return res.status(400).json({ message: 'Invalid user IDs.' });
    }

    try {
        // Convert user IDs to ObjectId
        const user1Id = new mongoose.Types.ObjectId(userId1);
        const user2Id = new mongoose.Types.ObjectId(userId2);

        // Fetch the chat between the two users
        const chat = await Chat.findOne({
            users: { $all: [user1Id, user2Id] },
        });

        // If no chat is found, return a 404 error
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Return the found chat with its _id
        res.json({ chatId: chat._id });
    } catch (error) {
        console.error('Error fetching chat:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
