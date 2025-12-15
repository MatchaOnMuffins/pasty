export const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'rust', 'go',
  'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin',
  'html', 'css', 'scss', 'json', 'yaml', 'markdown', 'sql', 'bash',
  'dockerfile', 'graphql', 'xml'
] as const;

export type Language = typeof LANGUAGES[number];

export const EXPIRY_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 10, label: '10 minutes' },
  { value: 60, label: '1 hour' },
  { value: 1440, label: '1 day' },
  { value: 10080, label: '1 week' },
  { value: 43200, label: '1 month' },
] as const;

export type ExpiryValue = typeof EXPIRY_OPTIONS[number]['value'];
