import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Tạo custom event để thông báo logout
const createLogoutEvent = (): void => {
  const event = new CustomEvent('auth:logout', {
    detail: { reason: 'token_expired' }
  });
  window.dispatchEvent(event);
};

interface RefreshTokenResponse {
  statusCode: number;
  message: string;
  data?: {
    access_token: string;
    refresh_token?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: {
        id: number;
        name: string;
      };
      address: string;
      gender: string;
      dayOfBirth: string;
      phone: string;
    };
  };
  // Legacy structures for backward compatibility
  tokens?: {
    access?: {
      token: string;
    };
    refresh?: {
      token: string;
    };
  };
  access?: {
    token: string;
  };
  refresh?: {
    token: string;
  };
  access_token?: string;
  refresh_token?: string;
}

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}



const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'https://eng-center-nestjs.onrender.com/api/v1'),
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Biến để tránh gọi refresh token nhiều lần
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null): void => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });

    failedQueue = [];
};

// Add a request interceptor
instance.interceptors.request.use(
    (config: any) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData requests
        // Let the browser set it automatically with boundary
        if (config.data instanceof FormData) {
            if (config.headers) {
                delete config.headers['Content-Type'];
            }
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response) {
            // Xử lý lỗi từ server
            if (error.response.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    // Nếu đang refresh, thêm request vào queue
                    return new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return instance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Gọi API refresh token: dùng HttpOnly cookie (withCredentials)
                    const response = await instance.get<RefreshTokenResponse>(
                        '/auth/refresh',
                        { withCredentials: true }
                    );

                    let newAccessToken: string | null = null;
                    let newRefreshToken: string | null = null;

                    // Xử lý response theo cấu trúc API mới
                    // New API structure: { statusCode, message, data: { access_token, user } }
                    if (response?.data?.data?.access_token) {
                        newAccessToken = response.data.data.access_token;
                        newRefreshToken = response.data.data.refresh_token || null;

                        // Update user data if provided
                        if (response.data.data.user) {
                            const userData = response.data.data.user;
                            // Normalize role field
                            if (userData.role && typeof userData.role === 'object' && 'id' in userData.role) {
                                const roleId = (userData.role as any).id;
                                (userData as any).role = roleId === 1 ? 'admin' :
                                              roleId === 2 ? 'teacher' :
                                              roleId === 3 ? 'parent' :
                                              roleId === 4 ? 'student' : 'unknown';
                            }
                            localStorage.setItem('userData', JSON.stringify(userData));
                        }
                    } else if (response?.data?.tokens?.access?.token) {
                        newAccessToken = response.data.tokens.access.token;
                        newRefreshToken = response.data.tokens.refresh?.token || null;
                    } else if (response?.data?.access?.token) {
                        newAccessToken = response.data.access.token;
                        newRefreshToken = response.data.refresh?.token || null;
                    } else if (response?.data?.access_token) {
                        newAccessToken = response.data.access_token;
                        newRefreshToken = response.data.refresh_token || null;
                    }

                    if (newAccessToken) {
                        localStorage.setItem('access_token', newAccessToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refresh_token', newRefreshToken);
                        }

                        // Cập nhật header cho request gốc
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        // Xử lý queue
                        processQueue(null, newAccessToken);

                        // Thực hiện lại request gốc
                        return instance(originalRequest);
                    } else {
                        throw new Error('Invalid refresh token response');
                    }
                } catch (refreshError) {
                    // Xử lý queue với lỗi
                    processQueue(refreshError, null);

                    // Logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('parent_id');
                    // Thông báo logout cho AuthContext
                    createLogoutEvent();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            // Trả về error object với response data để dễ xử lý
        return Promise.reject({
          response: {
            status: error.response.status,
            data: error.response.data
          }
        });
        } else {
            // Network errors (socket hang up, timeout, etc.)
            console.warn('🌐 Network error:', error.message, 'Code:', error.code);

            // Retry logic for network errors
            if (!originalRequest._networkRetry &&
                (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.message.includes('timeout'))) {
                originalRequest._networkRetry = true;
                console.log('🔄 Retrying network request...');

                // Wait a bit before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return instance(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
