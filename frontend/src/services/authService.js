import API from './api';

export async function loginUser(email, password) {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
}

export async function registerUser(name, email, password, role='PIN') {
  const res = await API.post('/auth/register', { name, email, password, role });
  return res.data;
}
