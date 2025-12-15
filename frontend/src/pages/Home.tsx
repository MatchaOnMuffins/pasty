import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPaste, listPastes } from '../api';
import type { PasteListItem } from '../types';

const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'rust', 'go',
  'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin',
  'html', 'css', 'scss', 'json', 'yaml', 'markdown', 'sql', 'bash',
  'dockerfile', 'graphql', 'xml'
];

const EXPIRY_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 10, label: '10 minutes' },
  { value: 60, label: '1 hour' },
  { value: 1440, label: '1 day' },
  { value: 10080, label: '1 week' },
  { value: 43200, label: '1 month' },
];

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [expiresIn, setExpiresIn] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPastes, setRecentPastes] = useState<PasteListItem[]>([]);

  useEffect(() => {
    listPastes(8).then(setRecentPastes).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const paste = await createPaste({
        title: title || undefined,
        content,
        language,
        expires_in: expiresIn || undefined,
      });
      navigate(`/${paste.id}`);
    } catch (error) {
      console.error('Failed to create paste:', error);
      alert('Failed to create paste. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="hero">
        <h1>Super quick pastebin</h1>
        <p>Paste anything, get a link, share it with anyone.</p>
      </div>

      <motion.div 
        className="editor-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="editor-header">
          <div className="window-dots">
            <div className="window-dot red"></div>
            <div className="window-dot yellow"></div>
            <div className="window-dot green"></div>
          </div>
          <input
            type="text"
            className="editor-title-input"
            placeholder="Untitled paste..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select 
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="editor-body">
          <textarea
            className="code-textarea"
            placeholder="Paste your code here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        </div>
        <div className="editor-footer">
          <div className="footer-options">
            <div className="option-group">
              <span className="option-label">Expires:</span>
              <select 
                className="expiry-select"
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <motion.button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <span>✦</span> Create Paste
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/*recentPastes.length > 0 && (
        <motion.div 
          className="recent-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="section-header">
            <h2 className="section-title">Recent Pastes</h2>
          </div>
          <div className="pastes-grid">
            {recentPastes.map((paste, index) => (
              <motion.div
                key={paste.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <Link to={`/${paste.id}`} className="paste-card">
                  <div className="paste-card-info">
                    <div className="paste-card-icon">
                      {paste.language.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="paste-card-title">
                        {paste.title || 'Untitled'}
                      </div>
                      <div className="paste-card-meta">
                        {formatTimeAgo(paste.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="paste-card-views">
                    {paste.views} view{paste.views !== 1 ? 's' : ''}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )*/}
    </motion.div>
  );
}

