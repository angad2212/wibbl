const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel')
const User = require('../models/userModel')
const Chat = require('../models/chatModel')


const sendMessage = asyncHandler(async(req,res)=>{
    const {content, chatId} = req.body; //we get the person to who user sends the message
    //and the message itself

    if(!content || !chatId){
        console.log('invalid data passed in request');
        return res.status(400);
    }

    //create that message in the database
    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    };
    try {
        // Save the new message to the database
        let message = await Message.create(newMessage);
    
        // Populate the sender's details (like name and profile picture)
        message = await message.populate("sender", "name");
        // Populate the chat details
        message = await message.populate("chat");
        // Populate the users in the chat with their details
        message = await User.populate(message, {
          path: "chat.users",
          select: "name email", // Get only name and email
        });
    
        // Update the chat with the latest message
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    
        // Send the message back in the response
        res.json(message);
      } catch (error) {
        // If there's an error, send a 400 response with the error message
        res.status(400).send(`Error: ${error.message}`);
      }
});

const allMessages = asyncHandler(async(req,res)=>{
    try {
        const messages = await Message.find({ chat: req.params.chatId })
          .populate("sender", "name pic email")
          .populate("chat");
        res.json(messages);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
})

module.exports = {sendMessage, allMessages} //export