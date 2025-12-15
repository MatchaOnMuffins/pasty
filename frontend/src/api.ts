import type { Paste, PasteCreateResponse, CreatePasteRequest } from './types';

// Use environment variable for API URL in production, fallback to relative path for dev
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export async function createPaste(data: CreatePasteRequest): Promise<PasteCreateResponse> {
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

export async function deletePaste(id: string, secretKey: string): Promise<void> {
  const response = await fetch(`${API_BASE}/pastes/${id}?secret_key=${encodeURIComponent(secretKey)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid secret key');
    }
    if (response.status === 404) {
      throw new Error('Paste not found');
    }
    throw new Error('Failed to delete paste');
  }
}

export async function getVisitCount(): Promise<{ visit_count: number }> {
  const response = await fetch(`${API_BASE}/stats/visits`);
  if (!response.ok) {
    throw new Error('Failed to fetch visit count');
  }
  return response.json();
}

export async function incrementVisitCount(): Promise<{ visit_count: number }> {
  const response = await fetch(`${API_BASE}/stats/visits`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to increment visit count');
  }
  return response.json();
}
