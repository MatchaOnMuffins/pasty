import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import ViewPaste from './pages/ViewPaste';
import { incrementVisitCount } from './api';

function App() {
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    // Increment visit count on first load
    incrementVisitCount()
      .then((data) => setVisitCount(data.visit_count))
      .catch(() => {});
  }, []);
  return (
    <>
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <motion.div 
              className="logo-icon"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              &lt;/&gt;
            </motion.div>
            <span className="logo-text">Pasty</span>
          </Link>
          {visitCount !== null && (
            <span className="visit-counter">
               {visitCount.toLocaleString()} views
            </span>
          )}
          <nav className="nav-links">
            <Link to="/" className="nav-link primary">
              + New Paste
            </Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:id" element={<ViewPaste />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          Built out of spite for Pastebin, which doesn't have a Vim mode • Pasty © {new Date().getFullYear()}
        </div>
      </footer>
    </>
  );
}

export default App;

