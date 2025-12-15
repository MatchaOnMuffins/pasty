import type { Paste, PasteListItem, CreatePasteRequest } from './types';

const API_BASE = '/api';

export async function createPaste(data: CreatePasteRequest): Promise<Paste> {
  const response = await fetch(`${API_BASE}/pastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create paste');
  }

  return response.json();
}

export async function getPaste(id: string): Promise<Paste> {
  const response = await fetch(`${API_BASE}/pastes/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Paste not found');
    }
    throw new Error('Failed to fetch paste');
  }

  return response.json();
}

export async function listPastes(limit = 10): Promise<PasteListItem[]> {
  const response = await fetch(`${API_BASE}/pastes?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch pastes');
  }

  return response.json();
}

