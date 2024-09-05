import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Chat from './Pages/Chat'

function App() {
  return (
    <div className="App">
<BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<Chat />} />

        </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App

