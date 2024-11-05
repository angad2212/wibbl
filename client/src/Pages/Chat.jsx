import React, { useState, useEffect } from 'react';
import fetchChats from '../Functions/fetchChats';

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userName, setUserName] = useState(''); // State to store the user's name
  const [loading, setLoading] = useState(true); // Loading state
  const [messages, setMessages] = useState({}); // State for messages
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for the search term

  useEffect(() => {
    // Retrieve user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo && userInfo.name) {
      setUserName(userInfo.name); // Set userName from stored data
    }

    // Call fetchChats function and pass the state setters
    const getChats = async () => {
      await fetchChats(setUsers, setLoading);
    };

    getChats();
  }, []); // Run only once on component mount

  const searchUsers = async (term) => {
    try {
      let response;
      // Check if there's a search term
      if (term) {
        // Fetch users based on the search term
        response = await fetch(`/api/user?search=${term}`); // Your search API endpoint
      } else {
        // If the search term is empty, fetch all users
        response = await fetch('/api/users'); // Adjust this to your endpoint for all users
      }

      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setUsers(data); // Update the users list with the filtered results
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Function to get chat ID
  const getChatId = async (loggedInUserId, selectedUserId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/chat/${loggedInUserId}/${selectedUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat ID');
      }
      const data = await response.json();
      return data.chatId; // Assuming the response has chatId
    } catch (error) {
      console.error('Error fetching chat ID:', error);
      return null;
    }
  };

  // Function to handle sending messages
  const handleSendMessage = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem("userInfo"));
    const loggedInUserId = loggedInUser._id;

    // Step 1: Get the chat ID
    const chatId = await getChatId(loggedInUserId, selectedUser._id);

    // Step 2: If a valid chat ID is retrieved, send the message
    if (chatId) {
      const response = await fetch('http://localhost:3000/api/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage, // Send the new message
          chatId: chatId,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        console.log('Message sent successfully:', message);

        // Add the new message to the local messages state
        const newMsg = {
          sender: userName,
          content: newMessage,
          timestamp: new Date().toLocaleTimeString(), // Set the timestamp
        };
        
        setMessages((prevMessages) => ({
          ...prevMessages,
          [selectedUser._id]: [...(prevMessages[selectedUser._id] || []), newMsg],
        }));

        setNewMessage(''); // Clear the input after sending
      } else {
        console.error('Failed to send message:', response.status);
      }
    } else {
      console.error('Chat ID could not be retrieved.');
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user); // Set the selected user
    localStorage.setItem('selectedUser', JSON.stringify(user)); // Store selected user in local storage
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search User"
            style={{
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #4CAF50',
              marginRight: '10px',
              color: 'black',
              backgroundColor: '#E0E0E0',
              fontSize: '14px', // Smaller font size
            }}
          />
          <button onClick={() => console.log('Create Group Chat clicked')} style={{
            padding: '5px 10px', // Smaller button size
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px' // Smaller font size
          }}>
            Create Group Chat
          </button>
        </div>
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
              filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
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
          <h2>{selectedUser ? `Chat with ${selectedUser.name}` : 'Select a user to start chatting'}</h2>
          <div style={{
            flexGrow: 1,
            backgroundColor: '#1E1E1E',
            borderRadius: '4px',
            padding: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            overflowY: 'auto'
          }}>
            {selectedUser && messages[selectedUser._id] && messages[selectedUser._id].length > 0 ? (
              messages[selectedUser._id].map((msg, index) => (
                <div key={index} style={{ margin: '10px 0', color: '#E0E0E0' }}>
                  <strong>{msg.sender}:</strong> {msg.content} <span style={{ fontSize: '12px', color: '#B0B0B0' }}>{msg.timestamp}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#E0E0E0' }}>No messages yet.</p>
            )}
          </div>
          {selectedUser && (
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4CAF50',
                  flexGrow: 1,
                  marginRight: '10px',
                  backgroundColor: 'white', // Changed to white
                  color: 'black' // Changed to black
                }}
              />
              <button onClick={handleSendMessage} style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer',
              }}>
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
