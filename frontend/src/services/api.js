import axios from 'axios';

// backend base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export default API;
