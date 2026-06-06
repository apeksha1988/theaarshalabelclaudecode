import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

// When a logged-in user's session expires the API returns 401. In that case
// clear their cart + auth flag and send them to login. Guests (never
// authenticated) are left alone so their cart isn't wiped while browsing.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem('wasAuthenticated') === '1'
    ) {
      localStorage.removeItem('wasAuthenticated');
      localStorage.removeItem('cart');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;