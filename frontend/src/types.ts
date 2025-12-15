export interface Paste {
  id: string;
  title: string | null;
  content: string;
  language: string;
  created_at: string;
  expires_at: string | null;
  views: number;
}

export interface PasteCreateResponse extends Paste {
  secret_key: string;
}

export interface PasteListItem {
  id: string;
  title: string | null;
  language: string;
  created_at: string;
  views: number;
}

export interface CreatePasteRequest {
  title?: string;
  content: string;
  language: string;
  expires_in?: number;
}

