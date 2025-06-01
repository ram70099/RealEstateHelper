import React from 'react';
import './Footer.css';
import { Building2 } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Building2 size={20} />
          <span className="footer-logo-text">PropIntel</span>
        </div>
        <div className="footer-tagline">
          Powered by AI | Made for brokers
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} PropIntel. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;