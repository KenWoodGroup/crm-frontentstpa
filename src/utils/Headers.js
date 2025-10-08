import axios from "axios";
import Cookies from "js-cookie";

export const BASE_URL = "https://test.edu-devosoft.uz";

export const $api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавление access token в заголовки
$api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Обработка ответа
$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refresh_token'); // здесь нужен refresh_token!
                const userId = Cookies.get('user_id');

                if (!refreshToken || !userId) {
                    throw new Error('Refresh token yoki user ID topilmadi');
                }

                // Отправляем запрос на обновление токена
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken: refreshToken,
                    userId: userId,
                });

                const newToken = response.data.access_token;
                const refresh = response.data.refresh_token;

                // Сохраняем новый токен
                Cookies.set('token', newToken);
                Cookies.set('refresh_token', refresh)

                // Обновляем заголовок и повторяем запрос
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return $api(originalRequest);

            } catch (refreshError) {
                // localStorage.clear();
                // window.location.href = '/login';
                Cookies.remove('token');
                Cookies.remove('refresh_token');
                Cookies.remove('user_id');
                window.location.href = '/login';
                // useNavigate('/login');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);