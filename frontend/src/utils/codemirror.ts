import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import type { Extension } from '@codemirror/state';

const LANGUAGE_MAP: Record<string, () => Extension> = {
  javascript: () => javascript(),
  js: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  ts: () => javascript({ typescript: true }),
  python: () => python(),
  py: () => python(),
  html: () => html(),
  css: () => css(),
  scss: () => css(),
  json: () => json(),
  markdown: () => markdown(),
  md: () => markdown(),
  sql: () => sql(),
  xml: () => xml(),
  graphql: () => xml(),
  java: () => java(),
  kotlin: () => java(),
  c: () => cpp(),
  cpp: () => cpp(),
  csharp: () => cpp(),
  php: () => php(),
  rust: () => rust(),
  go: () => go(),
};

export function getLanguageExtension(lang: string): Extension | null {
  const factory = LANGUAGE_MAP[lang];
  return factory ? factory() : null;
}
