import React, { useState } from 'react';
import { jwtDecode as decode } from 'jwt-decode';
import classNames from 'classnames/bind';
import styles from './Login.module.scss'


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const cx = classNames.bind(styles)
    const formData = new FormData();
    const api = process.env.REACT_APP_API_URL;


    // Xử lý form đăng nhập
    const handleLogin = async (e) => {
        e.preventDefault();
        formData.append('userName', username);
        formData.append('password', password);

        // Kiểm tra tài khoản
        try {
            const response = await fetch(api + "/user/login", {
                method: "POST",
                body: formData
            });

            console.log(response)

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const token = await response.text();// Giả sử API trả về token JWT

            // Lưu token vào localStorage
            localStorage.setItem("auth_token", token);

            // Giải mã token và lấy thông tin người dùng
            const decodedToken = decode(token);

            // Lưu thông tin người dùng vào localStorage hoặc context
            localStorage.setItem("user", JSON.stringify(decodedToken));

            // Điều hướng đến trang phù hợp dựa trên role


            if (decodedToken.roles[0].includes("ROLE_ADMIN")) {
                window.location.replace("/admin");
            } else if (decodedToken.roles[0].includes("ROLE_EMPLOYEE")) {
                window.location.replace("/employee");
            } else {
                window.location.replace("/student");
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={cx("login-container")}>
            <img
                src="https://actvn.edu.vn/Images/actvn_big_icon.png"
                alt="Logo"
            ></img>
            <h3>ĐĂNG NHẬP</h3>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Tài Khoản</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Đăng Nhập</button>
            </form>
        </div>
    );
};

export default Login;
