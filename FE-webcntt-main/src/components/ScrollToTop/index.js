import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
    const { pathname } = useLocation(); // Lấy thông tin route hiện tại

    useEffect(() => {
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    }, [pathname]); // Chạy lại khi route (pathname) thay đổi

    return null;
}

export default ScrollToTop;
