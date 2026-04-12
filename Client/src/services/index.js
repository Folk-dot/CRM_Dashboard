import api from './api.js';

// ── Auth ──────────────────────────────────────────────
export const authService = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Patients ──────────────────────────────────────────
export const patientsService = {
  getAll:    (params) => api.get('/patients', { params }),
  getById:   (id)     => api.get(`/patients/${id}`),
  getHistory:(id)     => api.get(`/patients/${id}/history`),
  create:    (data)   => api.post('/patients', data),
  update:    (id, data) => api.patch(`/patients/${id}`, data),
  remove:    (id)     => api.delete(`/patients/${id}`),
};

// ── Doctors ───────────────────────────────────────────
export const doctorsService = {
  getAll:         (params) => api.get('/doctors', { params }),
  getById:        (id)     => api.get(`/doctors/${id}`),
  getAppointments:(id)     => api.get(`/doctors/${id}/appointments`),
  create:         (data)   => api.post('/doctors', data),
  update:         (id, data) => api.patch(`/doctors/${id}`, data),
  remove:         (id)     => api.delete(`/doctors/${id}`),
};

// ── Appointments ──────────────────────────────────────
export const appointmentsService = {
  getAll:   (params) => api.get('/appointments', { params }),
  getToday: ()       => api.get('/appointments/today'),
  getById:  (id)     => api.get(`/appointments/${id}`),
  create:   (data)   => api.post('/appointments', data),
  update:   (id, data) => api.patch(`/appointments/${id}`, data),
  remove:   (id)     => api.delete(`/appointments/${id}`),
};

// ── Treatments ────────────────────────────────────────
export const treatmentsService = {
  getAll:  (params) => api.get('/treatments', { params }),
  getById: (id)     => api.get(`/treatments/${id}`),
  create:  (data)   => api.post('/treatments', data),
  update:  (id, data) => api.patch(`/treatments/${id}`, data),
  remove:  (id)     => api.delete(`/treatments/${id}`),
};

// ── Reminders ─────────────────────────────────────────
export const remindersService = {
  getAll:    (params) => api.get('/reminders', { params }),
  getOverdue:()       => api.get('/reminders/overdue'),
  getById:   (id)     => api.get(`/reminders/${id}`),
  create:    (data)   => api.post('/reminders', data),
  update:    (id, data) => api.patch(`/reminders/${id}`, data),
  remove:    (id)     => api.delete(`/reminders/${id}`),
};

// ── Treatment History ─────────────────────────────────
export const treatmentHistoryService = {
  getAll:  (params) => api.get('/treatment-history', { params }),
  getById: (id)     => api.get(`/treatment-history/${id}`),
  create:  (data)   => api.post('/treatment-history', data),
  update:  (id, data) => api.patch(`/treatment-history/${id}`, data),
  remove:  (id)     => api.delete(`/treatment-history/${id}`),
};
