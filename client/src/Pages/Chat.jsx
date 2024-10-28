import React, { useState } from 'react';

const ChatApp = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMessages([...messages, inputValue]);
      setInputValue('');
    }
  };

  return (
    <div>
      <ul id="messages">
        {messages.map((message, index) => (
          <li key={index} style={{ backgroundColor: index % 2 === 0 ? '#efefef' : 'transparent', padding: '0.5rem 1rem' }}>
            {message}
          </li>
        ))}
      </ul>
      <form id="form" onSubmit={handleSubmit} style={formStyle}>
        <input
          id="input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
          style={inputStyle}
        />
        <button style={buttonStyle}>Send</button>
      </form>
    </div>
  );
};

const formStyle = {
  background: 'rgba(0, 0, 0, 0.15)',
  padding: '0.25rem',
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  height: '3rem',
  boxSizing: 'border-box',
  backdropFilter: 'blur(10px)',
};

const inputStyle = {
  border: 'none',
  padding: '0 1rem',
  flexGrow: 1,
  borderRadius: '2rem',
  margin: '0.25rem',
};

const buttonStyle = {
  background: '#333',
  border: 'none',
  padding: '0 1rem',
  margin: '0.25rem',
  borderRadius: '3px',
  outline: 'none',
  color: '#fff',
};

export default ChatApp;
