import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vim } from '@replit/codemirror-vim';
import type { Extension } from '@codemirror/state';
import { createPaste } from '../api';
import { getLanguageExtension } from '../utils/codemirror';
import type { PasteCreateResponse } from '../types';
import type { Language, ExpiryValue } from '../constants';

const STORAGE_KEYS = {
  content: 'pasty_draft_content',
  title: 'pasty_draft_title',
  language: 'pasty_draft_language',
  vimMode: 'pasty_vim_mode',
} as const;

interface UsePasteFormReturn {
  // Form state
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  language: Language;
  setLanguage: (value: Language) => void;
  expiresIn: ExpiryValue;
  setExpiresIn: (value: ExpiryValue) => void;
  vimMode: boolean;
  toggleVimMode: () => void;

  // Submit state
  isSubmitting: boolean;
  canSubmit: boolean;
  handleSubmit: () => Promise<void>;

  // Result state
  createdPaste: PasteCreateResponse | null;
  secretKeyCopied: boolean;
  copySecretKey: () => Promise<void>;
  goToPaste: () => void;

  // CodeMirror
  extensions: Extension[];
}

export function usePasteForm(): UsePasteFormReturn {
  const navigate = useNavigate();

  // Form state - initialize from localStorage
  const [title, setTitle] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.title) || ''
  );
  const [content, setContent] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.content) || ''
  );
  const [language, setLanguage] = useState<Language>(() => 
    (localStorage.getItem(STORAGE_KEYS.language) as Language) || 'plaintext'
  );
  const [expiresIn, setExpiresIn] = useState<ExpiryValue>(0);
  const [vimMode, setVimMode] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.vimMode) === 'true'
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.content, content);
  }, [content]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.title, title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.vimMode, String(vimMode));
  }, [vimMode]);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [createdPaste, setCreatedPaste] = useState<PasteCreateResponse | null>(null);
  const [secretKeyCopied, setSecretKeyCopied] = useState(false);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  const extensions = useMemo<Extension[]>(() => {
    const exts: Extension[] = [];
    if (vimMode) exts.push(vim());
    const langExt = getLanguageExtension(language);
    if (langExt) exts.push(langExt);
    return exts;
  }, [language, vimMode]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.content);
    localStorage.removeItem(STORAGE_KEYS.title);
    localStorage.removeItem(STORAGE_KEYS.language);
    setContent('');
    setTitle('');
    setLanguage('plaintext');
  }, []);

  const handleSubmit = useCallback(async () => {
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
      clearDraft(); // Clear draft after successful creation
    } catch (error) {
      console.error('Failed to create paste:', error);
      alert('Failed to create paste. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, title, language, expiresIn, clearDraft]);

  const copySecretKey = useCallback(async () => {
    if (!createdPaste) return;
    await navigator.clipboard.writeText(createdPaste.secret_key);
    setSecretKeyCopied(true);
    setTimeout(() => setSecretKeyCopied(false), 2000);
  }, [createdPaste]);

  const goToPaste = useCallback(() => {
    if (createdPaste) {
      navigate(`/${createdPaste.id}`);
    }
  }, [createdPaste, navigate]);

  const toggleVimMode = useCallback(() => {
    setVimMode((prev) => !prev);
  }, []);

  return {
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
  };
}
