import React, { useEffect, useState } from 'react'; 
import axios from 'axios';

const Chat = () => {

    const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/chats');
      setChats(data);  // This will log the chat data
    } catch (error) {
      console.error('Error fetching chats:', error);  // This will catch and log any errors
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat._id}>{chat.chatName}</div>  // Add a key prop for each list item
      ))}
    </div>
  );
};

export default Chat;
