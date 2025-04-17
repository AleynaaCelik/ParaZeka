// src/App.js (güncellenen)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            {/* Diğer sayfalar için route'lar buraya eklenecek */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;