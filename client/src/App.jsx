import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Chat from './Pages/Chat'

function App() {
  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundImage: "url('/download.jpeg')", // Using the correct path
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}


export default App

