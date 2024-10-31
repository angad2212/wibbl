const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require("../models/userModel");

//this is responsible fo rcreating or fetching a one on one chat
// const accessChat = asyncHandler(async (req, res) => {
//     const { userId } = req.body; //this is the user id of the person you wanna make or search chat
  
//     if (!userId) {
//       console.log("UserId param not sent with request");
//       return res.sendStatus(400);
//     }
  
//     var isChat = await Chat.find({ //now we find the chat in the database
//       isGroupChat: false,
//       $and: [
//         { users: { $elemMatch: { $eq: req.user._id } } }, //this the is user id of logged in user
//         { users: { $elemMatch: { $eq: userId } } },
//       ],
//     })
//       .populate("users", "-password")
//       .populate("latestMessage");
  
//     isChat = await User.populate(isChat, {
//       path: "latestMessage.sender",
//       select: "name pic email",
//     });
  
//     if (isChat.length > 0) {
//       res.send(isChat[0]);
//     } else { //this else block takes care of the case where the chat doesnt already exist
//       var chatData = {
//         chatName: "sender",
//         isGroupChat: false,
//         users: [req.user._id, userId],
//       };
  
//       try {
//         const createdChat = await Chat.create(chatData);
//         const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
//           "users",
//           "-password"
//         );
//         res.status(200).json(FullChat);
//       } catch (error) {
//         res.status(400);
//         throw new Error(error.message);
//       }
//     }
//   });


const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body; // Get the userId from the request body
    
    // Check if userId is provided
    if (!userId) {
      console.log("UserId not provided with the request");
      return res.status(400).send("UserId is required"); // Return an error if not provided
    }
  
    // Try to find an existing chat between the logged-in user and the target user
    const existingChat = await Chat.find({
      isGroupChat: false, // Only look for one-on-one chats
      users: { $all: [req.user._id, userId] }, // Both users should be in the chat
    }).populate("users", "-password"); // Populate the users' details but exclude their passwords
  
    // If a chat already exists, return it
    if (existingChat.length > 0) {
      return res.send(existingChat[0]);
    }
  
    // If no chat exists, create a new one
    const newChat = new Chat({
      chatName: "sender", // For one-on-one chats, we can just use "sender" as a name
      isGroupChat: false, // This is not a group chat
      users: [req.user._id, userId], // Both users are added to the chat
    });
  
    try {
      const savedChat = await newChat.save(); // Save the new chat to the database
      const fullChat = await Chat.findOne({ _id: savedChat._id }).populate("users", "-password");
      return res.status(200).json(fullChat); // Return the newly created chat
    } catch (error) {
      return res.status(500).send("Failed to create chat");
    }
  });

  //we wanna get all the chats of the logged in user
  const fetchChats = asyncHandler(async (req, res) => {
    try {
      // Find chats where the logged-in user is part of the 'users' array
      const chats = await Chat.find({ users: { $in: [req.user._id] } })
      //It uses $in: [req.user._id], which simply checks if the user is part of the chat. 
      //It’s like asking: "Is this user in this chat?"
        .populate("users", "-password") // Populate users info (excluding passwords)
        .populate("groupAdmin", "-password") // Populate group admin info
        .populate("latestMessage") // Populate latest message details
        .sort({ updatedAt: -1 }); // Sort chats by most recently updated first
  
      // Populate sender info of the latest message
      const fullChats = await User.populate(chats, {
        path: "latestMessage.sender",
        select: "name email", // Only include name and email
      });
  
      res.status(200).send(fullChats); // Send the chats to the user
    } catch (error) {
      res.status(400).send({ message: error.message }); // If error, send error message
    }
  });

  //now we will create a group chat where multiple people can be a part of
  const createGroupChat = asyncHandler(async (req,res)=>{
    if(!req.body.name || !req.body.users){
        return res.status(400).send({
            message: "Please fill out all the fields"
        })
    }
    //The list of users is received as a string, 
    //so we use JSON.parse to convert it into an actual array (list of users).
    var users = JSON.parse(req.body.users);

    //a group chat must have 2+ users
    if(users.length < 2){
        return res.status(400).send({
            message: "More than 2 users required to create a group chat"
        })
    }
    users.push(req.user); //incude logged in person too

    try {
        // 5. Create a new group chat in the database
        const groupChat = await Chat.create({
          chatName: req.body.name,   
          users: users,              
          isGroupChat: true,        
          groupAdmin: req.user,      
        });
    
        // 6. Fetch the group chat and populate user details (but exclude passwords)
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
          .populate("users", "-password")  // Get user details but exclude password
          .populate("groupAdmin", "-password"); // Get admin details but exclude password
    
        // 7. Send the newly created group chat as a response
        res.status(200).json(fullGroupChat);
    
      } catch (error) {
        // 8. If there's any error, send a 400 status and the error message
        res.status(400);
        throw new Error(error.message);
      }

  })
  
  //for renaming a group
  const renameGroup = asyncHandler(async (req, res) => {
    // Get the chatId and chatName from the request body
    const { chatId, chatName } = req.body;
  
    // Find the chat by its ID and update the name
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId, // Find the chat by chatId
      { chatName: chatName }, // Change its name to the new name
      { new: true } // This makes sure we get the updated chat after the change
    )
      .populate("users", "-password") // Get user details, but hide their passwords
      .populate("groupAdmin", "-password"); // Get group admin details, but hide their passwords
  
    // If the chat is not found, send an error
    if (!updatedChat) {
      res.status(404); // Send a "not found" status
      throw new Error("Chat Not Found"); // Throw an error with a message
    } else {
      // If the chat is updated, send the updated chat data
      res.json(updatedChat); // Send the updated chat back to the user
    }
  });
  
  // This function adds a new user to a group chat
    const addToGroup = asyncHandler(async (req, res) => {
        // Get the chatId and userId from the request body
        const { chatId, userId } = req.body;
    
        // Try to find the chat and add the user
        const addedUserToChat = await Chat.findByIdAndUpdate(
        chatId, // Find the chat by its ID
        { $push: { users: userId } }, // Add the new user to the users array
        { new: true } // Return the updated chat after adding the user
        )
        .populate("users", "-password") // Get user details but hide passwords
        .populate("groupAdmin", "-password"); // Get group admin details but hide passwords
    
        // If the chat isn't found, send an error message
        if (!addedUserToChat) {
        res.status(404).send("Chat Not Found"); // 404 means "Not Found"
        } else {
        // If the user was successfully added, send back the updated chat
        res.json(addedUserToChat); // Send the updated chat details as a response
        }
  });
  
  //remove a member of the group
  const removeFromGroup = asyncHandler(async(req,res)=>{
    const {chatId, userId} = req.body;

    // We are removing a user from the group chat, so we need to update the chat's user list
    // The $pull operation removes a specific user (userId) from the list of users in the chat

    const updatedChat = await Chat.findByIdAndUpdate(chatId,{
        $pull: { users: userId }, // Remove the userId from the users array
    },
    {
        new: true, // Return the updated chat after the user has been removed
    }
    )

    .populate("users", "-password") // Include user info but exclude passwords
    .populate("groupAdmin", "-password"); // Include group admin info but exclude password

    // If the chat is not found, send a 404 error
    if (!updatedChat) {
        res.status(404).send("Chat Not Found");
    } else {
        // If the user was successfully removed, send back the updated chat
        res.json(updatedChat);
    }
  })

  module.exports = {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup}