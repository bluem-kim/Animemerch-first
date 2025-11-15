import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL });

export const toFormData = (obj) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === 'photos' && Array.isArray(v)) {
      v.forEach((file) => fd.append('photos', file));
    } else {
      fd.append(k, v);
    }
  });
  return fd;
};
