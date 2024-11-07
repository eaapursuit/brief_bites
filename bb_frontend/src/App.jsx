import './App.css';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom'
import Homepage from './Homepage';
import Section from './components/Section';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Homepage />} />
      <Route path='/sections/:id' element={<Section />} />
    </Routes>
  );
}

export default App;
