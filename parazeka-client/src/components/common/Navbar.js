// src/components/common/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          ParaZeka
        </Link>
        
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/transactions" className="nav-link">
              İşlemler
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/accounts" className="nav-link">
              Hesaplar
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/budgets" className="nav-link">
              Bütçeler
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/goals" className="nav-link">
              Hedefler
            </Link>
          </li>
        </ul>
        
        <div>
          <Link to="/login" className="btn btn-primary">
            Giriş Yap
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;