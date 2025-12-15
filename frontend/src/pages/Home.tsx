import { motion } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { LANGUAGES, EXPIRY_OPTIONS, type Language, type ExpiryValue } from '../constants';
import { usePasteForm } from '../hooks/usePasteForm';
import { SecretKeyModal } from '../components/SecretKeyModal';

const CODEMIRROR_SETUP = {
  lineNumbers: true,
  highlightActiveLineGutter: true,
  highlightActiveLine: true,
  foldGutter: true,
  dropCursor: true,
  allowMultipleSelections: true,
  indentOnInput: true,
  bracketMatching: true,
  closeBrackets: true,
  autocompletion: false,
  rectangularSelection: true,
  crosshairCursor: false,
  highlightSelectionMatches: true,
  tabSize: 2,
} as const;

export default function Home() {
  const {
    title,
    setTitle,
    content,
    setContent,
    language,
    setLanguage,
    expiresIn,
    setExpiresIn,
    vimMode,
    toggleVimMode,
    isSubmitting,
    canSubmit,
    handleSubmit,
    createdPaste,
    secretKeyCopied,
    copySecretKey,
    goToPaste,
    extensions,
  } = usePasteForm();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="hero">
        <h1>Super quick pastebin</h1>
        <p>Paste anything, get a link, share it with anyone.</p>
        <p>This thing even has a vim mode</p>
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
          <button
            className={`vim-toggle ${vimMode ? 'active' : ''}`}
            onClick={toggleVimMode}
            title={vimMode ? 'Disable Vim mode' : 'Enable Vim mode'}
          >
            <span className="vim-icon">⌨</span>
            VIM
          </button>
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="editor-body codemirror-wrapper">
          <CodeMirror
            value={content}
            height="400px"
            extensions={extensions}
            onChange={setContent}
            theme="dark"
            placeholder="Paste your code here..."
            basicSetup={CODEMIRROR_SETUP}
          />
        </div>

        <div className="editor-footer">
          <div className="footer-options">
            <div className="option-group">
              <span className="option-label">Expires:</span>
              <select
                className="expiry-select"
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value) as ExpiryValue)}
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
            disabled={!canSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? 'Creating...' : <><span>✦</span> Create Paste</>}
          </motion.button>
        </div>
      </motion.div>

      <SecretKeyModal
        paste={createdPaste}
        secretKeyCopied={secretKeyCopied}
        onCopySecretKey={copySecretKey}
        onGoToPaste={goToPaste}
      />
    </motion.div>
  );
}
