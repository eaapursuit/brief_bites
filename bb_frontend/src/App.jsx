import './App.css';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom'
import Homepage from './Homepage';
import SearchNews from './components/SearchBar';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Homepage />} />
      
    </Routes>
  );
}

export default App;
