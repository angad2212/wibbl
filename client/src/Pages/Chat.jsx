import React, { useState, useEffect, useRef } from 'react';
import fetchChats from '../Functions/fetchChats';

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo && userInfo.name) setUserName(userInfo.name); //Set userName from stored data

    const getChats = async () => {
      await fetchChats(setUsers, setLoading);
    };
    getChats();
  }, []);

  const searchUsers = async (term) => {
    try {
      let response = term
        ? await fetch(`/api/user?search=${term}`)
        : await fetch('/api/users');

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getChatId = async (loggedInUserId, selectedUserId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/chat/${loggedInUserId}/${selectedUserId}`);
      if (!response.ok) throw new Error('Failed to fetch chat ID');
      const data = await response.json();
      return data.chatId;
    } catch (error) {
      console.error('Error fetching chat ID:', error);
      return null;
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId) {
      console.error('Chat ID is missing');
      return;
    }

    const token = localStorage.getItem("token");  
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/message/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      console.log("Fetched messages:", data);  

      // Update state to store messages for the selected user
      setMessages(data.map(msg => ({
        sender: msg.sender.name, // Get sender's name from message data
        content: msg.content,
        timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem("userInfo"));
    const loggedInUserId = loggedInUser._id;

    const chatId = await getChatId(loggedInUserId, selectedUser._id);
    if (chatId) {
      const response = await fetch('http://localhost:3000/api/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          chatId: chatId,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        const newMsg = {
          sender: userName,
          content: newMessage,
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prevMessages) => [...prevMessages, newMsg]);
        setNewMessage('');
        // Scroll to bottom after sending a new message
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } else {
        console.error('Failed to send message:', response.status);
      }
    } else {
      console.error('Chat ID could not be retrieved.');
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    localStorage.setItem('selectedUser', JSON.stringify(user));

    const loggedInUser = JSON.parse(localStorage.getItem("userInfo"));
    const loggedInUserId = loggedInUser._id;
    
    try {
      const chatId = await getChatId(loggedInUserId, user._id);
      
      if (chatId) {
        await fetchMessages(chatId);  
      } else {
        console.error("Chat ID not found.");
      }
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: '100vw', height: '100vh',backgroundColor: '#121212', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        backgroundColor: '#1E1E1E',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#E0E0E0'
      }}>
      

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search User"
          style={{
            padding: '5px', borderRadius: '4px', color: 'black',
            backgroundColor: '#E0E0E0', fontSize: '14px'
          }}
          />
        
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', margin: '0', flexGrow: 1, textAlign: 'center' }}>Wibbl</h1>
        <span style={{ color: '#E0E0E0', fontSize: '20px' }}>{userName}</span>
      </div>

      <div style={{ flexGrow: 1, height:"100vh" , overflow:"hidden", display: 'flex' }}>
        <div className='user-list' style={{
          backgroundColor: '#2B2B2B', width: '250px', height: '100%',
          padding: '20px', overflowY: 'auto'
        }}>
          <h2 style={{ color: '#E0E0E0' }}>User List</h2>
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {loading ? (
              <li style={{ color: '#E0E0E0' }}>Loading users...</li>
            ) : (
              filteredUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  style={{
                    padding: '10px', cursor: 'pointer', color: '#E0E0E0',
                    backgroundColor: selectedUser && selectedUser._id === user._id ? '#3A3A3A' : 'transparent'
                  }}
                >
                  {user.name}
                </li>
              ))
            )}
          </ul>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '20px', color: '#E0E0E0' }}>
          <h2>{selectedUser ? `Chat with ${selectedUser.name}` : 'Select a user to start chatting'}</h2>
          <div style={{
            flexGrow: 1, backgroundColor: '#1E1E1E', borderRadius: '4px',
            padding: '10px', overflowY: 'auto', marginBottom: '10px',
            height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'scroll'
          }} ref={chatContainerRef}>
            {selectedUser && messages.length > 0 ? (
              messages.map((msg, index) => {
                const isLoggedInUser = msg.sender === userName;
                return (
                  <div key={index} style={{
                    display: 'flex',
                    flexDirection: isLoggedInUser ? 'row-reverse' : 'row', // Align messages based on sender
                    marginBottom: '15px',
                    alignItems: 'flex-end',
                  }}>
                    <div style={{ maxWidth: '70%', textAlign: isLoggedInUser ? 'right' : 'left' }}>
                      {/* Display sender's name */}
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: isLoggedInUser ? 'green' : '#E0E0E0' }}>
                        {msg.sender}
                      </div>
                      {/* Display message content */}
                      <div style={{
                        fontSize: '16px', color: '#E0E0E0', backgroundColor: '#3A3A3A', padding: '10px', borderRadius: '8px', maxWidth: '100%',
                        wordBreak: 'break-word'
                      }}>
                        {msg.content}
                      </div>
                      {/* Display timestamp */}
                      <div style={{
                        fontSize: '12px', color: '#A0A0A0', textAlign: 'right', marginTop: '5px',
                      }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#E0E0E0' }}>No messages yet.</p>
            )}
          </div>
          {selectedUser && (
            <div style={{ display: 'flex', marginTop: '10px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flexGrow: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#3A3A3A',
                  color: '#E0E0E0', border: 'none', fontSize: '16px', minWidth: '300px'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '10px 20px', marginLeft: '10px', borderRadius: '8px',
                  backgroundColor: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
