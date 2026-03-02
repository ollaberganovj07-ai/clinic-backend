const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    getPatients: () => request('/auth/patients'),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name, email, password, role = 'patient') =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      }),
    getUsers: () => request('/auth/users'),
    updateUserRole: (userId, role) =>
      request(`/auth/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
  },
  doctors: {
    getAll: (specialization) =>
      request(specialization ? `/doctors?specialization=${encodeURIComponent(specialization)}` : '/doctors'),
    getById: (id) => request(`/doctors/${id}`),
  },
  appointments: {
    getMine: () => request('/appointments'),
    getAll: () => request('/appointments/all'),
    create: (slotId, reason) =>
      request('/appointments', {
        method: 'POST',
        body: JSON.stringify({ slot_id: slotId, reason: reason || '' }),
      }),
    bookForPatient: (patientId, slotId, reason) =>
      request('/appointments/book-for-patient', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: patientId,
          slot_id: slotId,
          reason: reason || '',
        }),
      }),
    cancel: (id) =>
      request(`/appointments/${id}`, { method: 'DELETE' }),
  },
};
