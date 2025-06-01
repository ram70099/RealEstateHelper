import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="container header-container">
        <Link to="/" className="logo">
          <Building2 size={24} />
          <span className="logo-text">PropIntel</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/properties" className="nav-link">Properties</Link>
          <Link to="/emails" className="nav-link">
            <Mail size={16} />
            <span>Emails</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;