import { API_BASE } from '../constants';

export async function readApiResponse(response) {
  const text = await response.text();
  if (!text) {
    throw new Error('Backend is unavailable. Start the backend and MongoDB, then try again.');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Backend returned an invalid response (${response.status}).`);
  }
}

export async function fetchDatasetStats() {
  const res = await fetch(`${API_BASE}/dataset-stats`);
  if (!res.ok) throw new Error('Failed to fetch dataset stats');
  return res.json();
}

export async function fetchEvaluationMetrics() {
  const res = await fetch(`${API_BASE}/evaluation`);
  if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
  return res.json();
}

export async function fetchCurrentUser(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await readApiResponse(res);
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed.');
  }
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await readApiResponse(res);
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed.');
  }
  return data;
}

export async function fetchRecommendations(payload) {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await readApiResponse(res).catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch recommendations');
  }
  return res.json();
}
