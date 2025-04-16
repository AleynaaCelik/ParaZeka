// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container mt-4">
          <h1>ParaZeka Finans Uygulaması</h1>
          <p>Henüz yönlendirme ayarlanmadı.</p>
        </main>
      </div>
    </Router>
  );
}

export default App;