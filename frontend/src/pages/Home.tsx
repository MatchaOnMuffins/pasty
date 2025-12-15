import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPaste } from '../api';
import type { PasteCreateResponse } from '../types';

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


export default function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [expiresIn, setExpiresIn] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPaste, setCreatedPaste] = useState<PasteCreateResponse | null>(null);
  const [secretKeyCopied, setSecretKeyCopied] = useState(false);

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
      setCreatedPaste(paste);
    } catch (error) {
      console.error('Failed to create paste:', error);
      alert('Failed to create paste. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecretKey = async () => {
    if (!createdPaste) return;
    await navigator.clipboard.writeText(createdPaste.secret_key);
    setSecretKeyCopied(true);
    setTimeout(() => setSecretKeyCopied(false), 2000);
  };

  const goToPaste = () => {
    if (createdPaste) {
      navigate(`/${createdPaste.id}`);
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

      {/* Secret Key Modal */}
      <AnimatePresence>
        {createdPaste && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="modal-header">
                <span className="modal-icon">🔐</span>
                <h2>Paste Created!</h2>
              </div>
              <div className="modal-body">
                <p className="modal-description">
                  Save this secret key to delete your paste later. <strong>This will only be shown once!</strong>
                </p>
                <div className="secret-key-container">
                  <code className="secret-key">{createdPaste.secret_key}</code>
                  <motion.button
                    className={`copy-secret-btn ${secretKeyCopied ? 'copied' : ''}`}
                    onClick={copySecretKey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {secretKeyCopied ? '✓ Copied' : 'Copy'}
                  </motion.button>
                </div>
              </div>
              <div className="modal-footer">
                <motion.button
                  className="modal-btn primary"
                  onClick={goToPaste}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Paste →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

