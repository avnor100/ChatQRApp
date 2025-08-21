
// api.js
import { currentServerUrl } from '../App'; // adjust path if needed
import { API_BASE as FALLBACK_BASE } from './config'; // keep as fallback

async function getBase() {
  // Prefer the runtime URL saved from the Settings/URL modal
  const saved = await currentServerUrl();
  const base = (saved && saved.trim()) || FALLBACK_BASE || '';
  if (!base) {
    throw new Error('Server URL not set. Tap the “URL” button in the app and paste your Cloudflare link.');
  }
  return base.replace(/\/+$/, ''); // trim trailing slash
}

async function handle(res) {
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || `HTTP ${res.status}`);
  }
  // some endpoints might return text; try JSON then fallback
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return txt; }
}

export async function guestSignIn() {
  const base = await getBase();
  return handle(await fetch(`${base}/auth/guest`, { method: 'POST' }));
}

export async function listGroups(token) {
  const base = await getBase();
  return handle(await fetch(`${base}/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  }));
}

export async function createGroup(token, name) {
  const base = await getBase();
  return handle(await fetch(`${base}/groups`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  }));
}

export async function getMessages(token, groupId, limit = 30) {
  const base = await getBase();
  return handle(await fetch(`${base}/groups/${groupId}/messages?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  }));
}

export async function sendMessage(token, groupId, text) {
  const base = await getBase();
  return handle(await fetch(`${base}/groups/${groupId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  }));
}

export async function createInvite(token, groupId, expiresInHours = 24, uses = 5) {
  const base = await getBase();
  return handle(await fetch(`${base}/groups/${groupId}/invites`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresInHours, uses }),
  }));
}

export async function acceptInvite(token, inviteToken) {
  const base = await getBase();
  return handle(await fetch(`${base}/invites/${inviteToken}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }));
}
