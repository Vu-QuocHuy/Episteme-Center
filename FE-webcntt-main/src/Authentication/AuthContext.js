import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode as jwt_decode } from 'jwt-decode';

// Tạo Context cho Auth
export const AuthContext = createContext();

// Hàm kiểm tra token có hết hạn hay không
const isTokenExpired = (token) => {
    try {
        const decoded = jwt_decode(token);
        const expirationDate = decoded.exp * 1000; // Chuyển đổi từ giây sang ms
        const currentDate = new Date().getTime();
        return expirationDate < currentDate;
    } catch (e) {
        return true; // Nếu không giải mã được token, coi như đã hết hạn
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(); // Lưu thông tin user

    // Khi ứng dụng được khởi động, kiểm tra JWT token từ localStorage
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token && !isTokenExpired(token)) {
            const decoded = jwt_decode(token);
            setUser({
                username: decoded.userName,
                entityId: decoded.entityId,
                avaFileCode: decoded.avaFileCode,
                roles: decoded.roles,
            });
        } else {
            console.log("Token is expired or missing");
            setUser(null);
            localStorage.clear(); // Nếu không có token hoặc token hết hạn, reset user
        }
    }, []);

    // Hàm đăng nhập: Lưu token vào localStorage và cập nhật state user
    const login = (token) => {
        localStorage.setItem('auth_token', token); // Lưu JWT vào localStorage
        const decoded = jwt_decode(token);
        setUser({
            username: decoded.userName,
            entityId: decoded.entityId,
            avaFileCode: decoded.avaFileCode,
            roles: decoded.roles,
        });
    };

    // Hàm đăng xuất: Xóa token khỏi localStorage và reset state user
    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    // Cung cấp giá trị cho context
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để sử dụng context ở các component khác
export const useAuth = () => {
    return useContext(AuthContext);
};
