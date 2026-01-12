import axios from "axios";
import Cookies from "js-cookie";
import forceLogin from "./Helpers/forceLogin";

export const BASE_URL = "https://api.usderp.uz/crm";

export const $api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ===============================
   GLOBAL REFRESH STATE
================================ */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/* ===============================
   REQUEST INTERCEPTOR
================================ */
$api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

            // if refreshing wait
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = 'Bearer ' + token;
                            resolve($api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = Cookies.get('refresh_token');
                const userId = Cookies.get('us_nesw');

                if (!refreshToken || !userId) {
                    throw new Error('Refresh token yoki user ID yo‘q');
                }

                const { data } = await axios.post(
                    `${BASE_URL}/api/auth/refresh`,
                    { refreshToken, userId }
                );

                const newAccessToken = data.access_token;
                const newRefreshToken = data.refresh_token;

                Cookies.set('token', newAccessToken);
                Cookies.set('refresh_token', newRefreshToken);

                $api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

                // Continue CRUDs in process queue
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return $api(originalRequest);

            } catch (err) {
                // 🔴 Refresh failed → all logout
                processQueue(err, null);

                Cookies.remove('token');
                Cookies.remove('refresh_token');
                Cookies.remove('us_nesw');

                Cookies.remove('nesw');
                window.location.href = '/login';

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }

        }
        return Promise.reject(error);
    }
);
