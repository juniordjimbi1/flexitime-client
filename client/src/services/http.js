// src/services/http.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

const http = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
