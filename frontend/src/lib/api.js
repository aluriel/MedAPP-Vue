import { supabase } from './supabase';

// In production, Vercel's vercel.json rewrites /api → backend service.
// In dev, vite.config.js proxies /api → http://localhost:3001.
const BASE = '/api';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function request(method, path, body) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get:   (path)       => request('GET',    path),
  post:  (path, body) => request('POST',   path, body),
  patch: (path, body) => request('PATCH',  path, body),
  del:   (path, body) => request('DELETE', path, body),
};
