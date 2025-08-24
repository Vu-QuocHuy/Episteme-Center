import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

import { loginAPI, loginAdminAPI, logoutAPI, refreshTokenAPI } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken?: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { accessToken: string; refreshToken?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

interface AuthContextType extends Omit<AuthState, 'refreshToken'> {
  login: (credentials: LoginCredentials, isAdmin?: boolean) => Promise<LoginResponse | null>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  updateUser: (updatedData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true, // Keep this true during initial load
  error: null
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || null,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          ...action.payload,
        } : null,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userData = localStorage.getItem('userData');
    const sessionActive = localStorage.getItem('session_active');

    console.log('🚀 AuthContext initializing...', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData,
      sessionActive: !!sessionActive
    });

        if (token && userData) {
      try {
        let user: User = JSON.parse(userData);

        // Normalize role field on restore from localStorage
        if (user.role && typeof user.role === 'object' && 'id' in user.role) {
          const roleId = (user.role as any).id;
          (user as any).role = roleId === 1 ? 'admin' :
                    roleId === 2 ? 'teacher' :
                    roleId === 3 ? 'parent' :
                    roleId === 4 ? 'student' : 'unknown';
        }

        // Nếu là parent và thiếu permissions thì bổ sung mặc định
        if (user.role === 'parent' && !(user as any).permissions) {
          (user as any).permissions = [
            'view_child_info',
            'view_child_attendance',
            'view_fees',
            'make_payment',
            'view_schedule'
          ];
          localStorage.setItem('userData', JSON.stringify(user));
        }

        console.log('🔐 Restoring user session:', user.email, 'Role:', user.role);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, accessToken: token, refreshToken: refreshToken || undefined }
        });
      } catch (error) {
        console.error('❌ Error restoring user session:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    } else if (refreshToken && userData) {
      // Always try refresh if we have refreshToken and userData, regardless of access token
      // Nếu thiếu access_token nhưng có refresh_token và userData, tự động refresh
      (async () => {
        try {
          let user: User = JSON.parse(userData);

          // Normalize role field on restore from localStorage
          if (user.role && typeof user.role === 'object' && 'id' in user.role) {
            const roleId = (user.role as any).id;
            (user as any).role = roleId === 1 ? 'admin' :
                      roleId === 2 ? 'teacher' :
                      roleId === 3 ? 'parent' :
                      roleId === 4 ? 'student' : 'unknown';
          }

          const response = await refreshTokenAPI(refreshToken);
          let newAccessToken: string | null = null;
          let newRefreshToken: string | null = null;
          if (response?.data?.data?.access_token) {
            newAccessToken = response.data.data.access_token;
            newRefreshToken = response.data.data.refresh_token || null;
          } else if (response?.data?.access_token) {
            newAccessToken = response.data.access_token;
            newRefreshToken = response.data.refresh_token || null;
          } else if (response?.data?.tokens?.access?.token) {
            newAccessToken = response.data.tokens.access.token;
            newRefreshToken = response.data.tokens.refresh?.token || null;
          } else if (response?.data?.access?.token) {
            newAccessToken = response.data.access.token;
            newRefreshToken = response.data.refresh?.token || null;
          }
          if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken }
            });
          } else {
            throw new Error('Invalid refresh token response');
          }
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('userData');
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      })();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    // Lắng nghe event logout từ axios interceptor
    const handleLogoutEvent = (event: CustomEvent) => {
      console.log('Received logout event:', event.detail);
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:logout', handleLogoutEvent as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent as EventListener);
    };
  }, []);

  // Luôn đồng bộ user/token vào localStorage khi thay đổi
  useEffect(() => {
    if (state.user && state.token) {
      console.log('💾 Saving user session to localStorage:', state.user.email);
      localStorage.setItem('access_token', state.token);
      localStorage.setItem('userData', JSON.stringify(state.user));
      if (state.refreshToken) {
        localStorage.setItem('refresh_token', state.refreshToken);
      }
      if (state.user.role === 'parent' && state.user.parentId) {
        localStorage.setItem('parent_id', state.user.parentId);
      }

      // Set a flag to indicate session is active
      localStorage.setItem('session_active', 'true');
    } else if (!state.user && !state.loading && localStorage.getItem('session_active')) {
      // Only clear if we're not loading AND we had an active session (to avoid clearing during initialization)
      console.log('🧹 Clearing localStorage due to logout');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userData');
      localStorage.removeItem('parent_id');
      localStorage.removeItem('session_active');
    }
  }, [state.user, state.token, state.refreshToken, state.loading]);

  const login = async (credentials: LoginCredentials, isAdmin: boolean = false): Promise<LoginResponse | null> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      console.log('🔐 Attempting login...', { email: credentials.email, isAdmin });

      const apiResponse = await Promise.race([
        isAdmin ? loginAdminAPI({
          email: credentials.email,
          password: credentials.password
        }) : loginAPI({
          email: credentials.email,
          password: credentials.password
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);

      console.log('📋 Raw API Response:', apiResponse);

      let userData: User | null = null;
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      // Ưu tiên lấy theo cấu trúc thực tế mới
      if (apiResponse?.data?.user && apiResponse?.data?.tokens?.access?.token) {
        userData = apiResponse.data.user;
        accessToken = apiResponse.data.tokens.access.token;
        refreshToken = apiResponse.data.tokens.refresh?.token || null;
      } else if (apiResponse?.data?.user && apiResponse?.data?.tokens?.access?.token) {
        userData = apiResponse.data.user;
        accessToken = apiResponse.data.tokens.access.token;
        refreshToken = apiResponse.data.tokens.refresh?.token || null;
      } else {
        // fallback cho các cấu trúc cũ
        if (apiResponse?.data?.data) {
          userData = apiResponse.data.data.user;
          accessToken = apiResponse.data.data.access_token || apiResponse.data.data.accessToken;
          refreshToken = apiResponse.data.data.refresh_token || apiResponse.data.data.refreshToken;
        } else if (apiResponse?.data) {
          userData = apiResponse.data.user;
          accessToken = apiResponse.data.access_token || apiResponse.data.accessToken;
          refreshToken = apiResponse.data.refresh_token || apiResponse.data.refreshToken;
        } else if (apiResponse?.data?.user) {
          userData = apiResponse.data.user;
          accessToken = apiResponse.data.access_token || apiResponse.data.accessToken;
          refreshToken = apiResponse.data.refresh_token || apiResponse.data.refreshToken;
        }
      }

      console.log('🔍 Parsed tokens:', {
        hasUserData: !!userData,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      if (!userData || !accessToken) {
        console.error('❌ Invalid response structure:', { userData, accessToken });
        throw new Error('Invalid response structure: missing user data or token');
      }

      // Normalize role field - handle both string and object role
      if (userData.role && typeof userData.role === 'object' && 'id' in userData.role) {
        // If role is an object with id, extract the id as the role string
        const roleId = (userData.role as any).id;
                    (userData as any).role = roleId === 1 ? 'admin' :
                          roleId === 2 ? 'teacher' :
                          roleId === 3 ? 'parent' :
                          roleId === 4 ? 'student' : 'unknown';
      }

      console.log('✅ Login successful:', {
        user: userData,
        role: userData.role,
        roleType: typeof userData.role
      });

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      if (userData.role === 'parent' && userData.parentId) {
        localStorage.setItem('parent_id', userData.parentId);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken || undefined
        }
      });

      return { user: userData, accessToken, refreshToken: refreshToken || undefined };

    } catch (error: any) {
      let errorMessage = 'Đăng nhập thất bại';

      if (error.message === 'Request timeout') {
        errorMessage = 'Kết nối API timeout. Vui lòng thử lại.';
      } else if (error.response?.data?.message) {
        // Dịch các thông báo lỗi phổ biến từ tiếng Anh sang tiếng Việt
        const backendMessage = error.response.data.message;
        const errorTranslations: Record<string, string> = {
          'Incorrect email or password': 'Email hoặc mật khẩu không đúng',
          'Invalid email or password': 'Email hoặc mật khẩu không đúng',
          'Email or password is incorrect': 'Email hoặc mật khẩu không đúng',
          'User not found': 'Tài khoản không tồn tại',
          'Account not found': 'Tài khoản không tồn tại',
          'Email not found': 'Email không tồn tại',
          'Password is incorrect': 'Mật khẩu không đúng',
          'Invalid credentials': 'Thông tin đăng nhập không hợp lệ',
          'Authentication failed': 'Xác thực thất bại',
          'Login failed': 'Đăng nhập thất bại',
          'Account is disabled': 'Tài khoản đã bị vô hiệu hóa',
          'Account is locked': 'Tài khoản đã bị khóa',
          'Too many login attempts': 'Quá nhiều lần đăng nhập thất bại',
          'Please try again later': 'Vui lòng thử lại sau',
          'Server error': 'Lỗi server',
          'Internal server error': 'Lỗi server nội bộ'
        };

        errorMessage = errorTranslations[backendMessage] || backendMessage;
      } else if (error.response?.status === 401) {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.message && error.message !== 'Request timeout') {
        errorMessage = error.message;
      }

      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });

      // Không throw error để tránh reload trang
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await logoutAPI(refreshToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userData');
      localStorage.removeItem('parent_id');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await refreshTokenAPI(refreshToken);

      let newAccessToken: string | null = null;
      let newRefreshToken: string | null = null;

      // Xử lý response theo cấu trúc API mới
      console.log('🔄 Refresh token response:', response);

      if (response?.data?.data?.access_token) {
        // New API structure: { data: { access_token, user } }
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
      } else if (response?.data?.access_token) {
        // Fallback structure
        newAccessToken = response.data.access_token;
        newRefreshToken = response.data.refresh_token || null;
      } else if (response?.data?.tokens?.access?.token) {
        // Old structure
        newAccessToken = response.data.tokens.access.token;
        newRefreshToken = response.data.tokens.refresh?.token || null;
      } else if (response?.data?.access?.token) {
        // Another old structure
        newAccessToken = response.data.access.token;
        newRefreshToken = response.data.refresh?.token || null;
      }

      if (!newAccessToken) {
        throw new Error('Invalid refresh token response');
      }

      // Cập nhật localStorage
      localStorage.setItem('access_token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      // Cập nhật state
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken ?? undefined
        }
      });

      return newAccessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Nếu refresh token thất bại, logout user
      await logout();
      // Không throw error để tránh reload trang
      return null;
    }
  };

  const updateUser = (updatedData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: updatedData });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
