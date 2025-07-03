
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://10.0.2.2:4000/api',
  //baseURL: 'https://cookingapp-production.up.railway.app/api',
  timeout: 5000,
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
