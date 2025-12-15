import { motion, AnimatePresence } from 'framer-motion';
import type { PasteCreateResponse } from '../types';

interface SecretKeyModalProps {
  paste: PasteCreateResponse | null;
  secretKeyCopied: boolean;
  onCopySecretKey: () => void;
  onGoToPaste: () => void;
}

export function SecretKeyModal({
  paste,
  secretKeyCopied,
  onCopySecretKey,
  onGoToPaste,
}: SecretKeyModalProps) {
  return (
    <AnimatePresence>
      {paste && (
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
                Save this secret key to delete your paste later.{' '}
                <strong>This will only be shown once!</strong>
              </p>
              <div className="secret-key-container">
                <code className="secret-key">{paste.secret_key}</code>
                <motion.button
                  className={`copy-secret-btn ${secretKeyCopied ? 'copied' : ''}`}
                  onClick={onCopySecretKey}
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
                onClick={onGoToPaste}
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
  );
}
