import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vim } from '@replit/codemirror-vim';
import type { Extension } from '@codemirror/state';
import { createPaste } from '../api';
import { getLanguageExtension } from '../utils/codemirror';
import type { PasteCreateResponse } from '../types';
import type { Language, ExpiryValue } from '../constants';

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

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<Language>('plaintext');
  const [expiresIn, setExpiresIn] = useState<ExpiryValue>(0);
  const [vimMode, setVimMode] = useState(false);

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
    } catch (error) {
      console.error('Failed to create paste:', error);
      alert('Failed to create paste. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, title, language, expiresIn]);

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
