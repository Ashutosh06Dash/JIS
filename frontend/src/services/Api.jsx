import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // update with your backend URL
});

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("API Request:", config.method.toUpperCase(), config.url);
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Error:", 
      error.response ? 
      `${error.response.status} - ${error.response.data?.message || error.message}` : 
      error.message
    );
    return Promise.reject(error);
  }
);

export default api;
