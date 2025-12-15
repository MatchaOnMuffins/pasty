import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import { getPaste } from '../api';
import type { Paste } from '../types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    getPaste(id)
      .then(setPaste)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const copyCode = async () => {
    if (!paste) return;
    await navigator.clipboard.writeText(paste.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <motion.div 
        className="error-message"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2>Paste Not Found</h2>
        <p>This paste may have expired or been deleted.</p>
        <Link to="/" className="nav-link primary" style={{ display: 'inline-block', marginTop: '24px' }}>
          Create New Paste
        </Link>
      </motion.div>
    );
  }

  // Map language names to Prism language keys
  const getPrismLanguage = (lang: string): string => {
    const mapping: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'yml': 'yaml',
      'md': 'markdown',
      'sh': 'bash',
      'shell': 'bash',
      'dockerfile': 'docker',
      'plaintext': 'plain',
    };
    return mapping[lang] || lang;
  };

  return (
    <motion.div
      className="paste-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="paste-header">
        <div className="paste-info">
          <h1>{paste.title || 'Untitled'}</h1>
          <div className="paste-meta">
            <div className="paste-meta-item">
              <span>📅</span>
              {formatDate(paste.created_at)}
            </div>
            <div className="paste-meta-item">
              <span>👁</span>
              {paste.views} view{paste.views !== 1 ? 's' : ''}
            </div>
            {paste.expires_at && (
              <div className="paste-meta-item">
                <span>⏱</span>
                Expires {formatDate(paste.expires_at)}
              </div>
            )}
          </div>
        </div>
        <div className="paste-actions">
          <motion.button 
            className={`action-btn ${linkCopied ? 'copied' : ''}`}
            onClick={copyLink}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {linkCopied ? '✓ Copied!' : '🔗 Share'}
          </motion.button>
          <motion.button 
            className={`action-btn ${copied ? 'copied' : ''}`}
            onClick={copyCode}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </motion.button>
        </div>
      </div>

      <motion.div 
        className="code-block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="code-block-header">
          <span className="code-language">{paste.language}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {paste.content.split('\n').length} lines
          </span>
        </div>
        <div className="code-content">
          <Highlight
            theme={themes.nightOwl}
            code={paste.content}
            language={getPrismLanguage(paste.language)}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={className} style={{ ...style, background: 'transparent', margin: 0 }}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '3em', 
                      color: 'var(--text-muted)',
                      userSelect: 'none',
                      textAlign: 'right',
                      marginRight: '1em',
                      opacity: 0.5,
                    }}>
                      {i + 1}
                    </span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </motion.div>

      <motion.div
        style={{ marginTop: '24px', textAlign: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link to="/" className="nav-link" style={{ 
          background: 'var(--bg-tertiary)', 
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: 'var(--radius-sm)',
        }}>
          ← Create New Paste
        </Link>
      </motion.div>
    </motion.div>
  );
}

