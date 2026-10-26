import React from 'react';

/**
 * Accessible Footer Component
 */
const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">📖 Padshala</span>
          <p className="footer-desc">
            Empowering students and educators with a lightweight, accessible digital learning portal.
          </p>
        </div>
        <div className="footer-tech">
          <span className="tech-badge">MongoDB</span>
          <span className="tech-badge">Express</span>
          <span className="tech-badge">React</span>
          <span className="tech-badge">Node.js</span>
        </div>
        <div className="footer-copy">
          <p>© {new Date().getFullYear()} Padshala. Built following ICTAK Full Stack Guidelines.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
