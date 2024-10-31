import React, { useState, useEffect } from 'react';
import fetchChats from '../Functions/fetchChats'

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userName, setUserName] = useState(''); // State to store the user's name
  const [loading, setLoading] = useState(true); // Loading state
  const [messages, setMessages] = useState({}); // State for messages
  const [users, setUsers] = useState([]);
  //const [chatList, setChatList] = useState([]);

  // const users = [
  //   { _id: '1', name: 'user1' },
  //   { _id: '2', name: 'user2' },
  //   { _id: '3', name: 'user3' }
  // ];

  useEffect(() => {
    // Retrieve user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo && userInfo.name) {
      setUserName(userInfo.name); // Set userName from stored data
    }

    const fetchChats = async () => {
      const token = localStorage.getItem("token"); // Retrieve token from local storage
      const loggedInUser = JSON.parse(localStorage.getItem("userInfo")); // Get user info from local storage
  
      // Retrieve the logged-in user's ID from the user info
      const excludedUserId = loggedInUser?._id || ''; // Accessing _id directly
  
      console.log('Logged In User ID:', excludedUserId); // Log the user ID for debugging
  
      const response = await fetch('http://localhost:3000/api/chat', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      });
  
      if (response.ok) {
          const data = await response.json();
          const allUsers = [];
  
          data.forEach(chat => {
              chat.users.forEach(user => {
                  // Exclude the logged-in user dynamically
                  if (user._id !== excludedUserId && !allUsers.find(u => u._id === user._id)) {
                      allUsers.push(user); // Avoid duplicates
                  }
              });
          });
  
          console.log('Filtered Users:', allUsers); // Log the filtered users for debugging
          setUsers(allUsers); // Set the state with all unique users excluding the specified user
          setLoading(false);
      } else {
          console.error('Failed to fetch chats:', response.status);
          setLoading(false);
      }
  };
  

    fetchChats();

    
    setLoading(false); // Set loading to false after setting the username
  }, []); // Run only once on component mount

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedUser) return; // Prevent sending empty messages
    const messageData = {
      content: newMessage,
      sender: userName, // Use the user's name as sender
      timestamp: new Date().toLocaleTimeString(),
    };
    
    // Append the message to the selected user's chat
    setMessages((prev) => ({
      ...prev,
      [selectedUser._id]: [...(prev[selectedUser._id] || []), messageData],
    }));
    
    setNewMessage(''); // Clear the input after sending
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user); // Set the selected user
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#121212', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <div style={{
        backgroundColor: '#1E1E1E',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        color: '#E0E0E0'
      }}>
        <button onClick={() => console.log('Create Group Chat clicked')} style={{
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#4CAF50',
          color: 'white',
          cursor: 'pointer'
        }}>
          Create Group Chat
        </button>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', margin: '0', flexGrow: 1, textAlign: 'center' }}>Wibbl</h1>
        <span style={{ color: '#E0E0E0', fontSize: '20px' }}>{userName}</span>
      </div>

      <div style={{ flexGrow: 1, display: 'flex' }}>
        <div 
          className='user-list' 
          style={{ 
            backgroundColor: '#2B2B2B', 
            width: '250px', 
            height: '100%', 
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            overflowY: 'auto' // Allow scrolling if the list is long
          }}
        >
          <h2 style={{ color: '#E0E0E0' }}>User List</h2>
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {loading ? (
              <li style={{ color: '#E0E0E0' }}>Loading users...</li>
            ) : (
              users.length > 0 ? (
                users.map((user) => (
                  <li
                    key={user._id} // Use _id as the key
                    onClick={() => handleUserSelect(user)}
                    style={{
                      padding: '10px',
                      backgroundColor: selectedUser && selectedUser._id === user._id ? '#3A3A3A' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                      color: '#E0E0E0'
                    }}
                  >
                    {user.name}
                  </li>
                ))
              ) : (
                <li style={{ color: '#E0E0E0' }}>No users found</li>
              )
            )}
          </ul>
        </div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '20px', color: '#E0E0E0' }}>
          {/* Chat Interface */}
          <h2>{selectedUser ? `Chat with ${selectedUser.name}` : 'Select a user to start chatting...'}</h2>
          <div style={{ flexGrow: 1, marginBottom: '20px', borderRadius: '4px', padding: '10px', backgroundColor: '#222' }}>
            {selectedUser && messages[selectedUser._id] && messages[selectedUser._id].map((msg, index) => (
              <div key={index} style={{ margin: '5px 0' }}>
                <strong style={{ color: '#4CAF50' }}>{msg.sender}:</strong> <span style={{ color: '#E0E0E0' }}>{msg.content}</span>
                <div style={{ fontSize: '0.8em', color: 'gray' }}>{msg.timestamp}</div>
              </div>
            ))}
          </div>
          
          {/* Show input only if a user is selected */}
          {selectedUser && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flexGrow: 1,
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4CAF50',
                  marginRight: '10px',
                  color: 'black',
                  backgroundColor: '#E0E0E0'
                }}
              />
              <button 
                onClick={handleSendMessage}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
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
