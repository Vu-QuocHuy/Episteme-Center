import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import { Link } from "react-router-dom";
import { useAuth } from "~/Authentication/AuthContext";
import Tippy from '@tippyjs/react/headless';
import { useEffect, useState } from "react";


function Header() {
  const cx = classNames.bind(styles);
  const { user } = useAuth();
  const api = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("auth_token")
  const handleLogout = async () => {
    localStorage.clear();
    await fetch(`${api}/user/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    window.location.replace(`/`);
  }

  const [route, setRoute] = useState("");

  useEffect(() => {
    if (user) {
      if (user.roles[0] === 'ROLE_ADMIN')
        setRoute("admin")
      else if (user.roles[0] === 'ROLE_EMPLOYEE')
        setRoute('employee')
      else if (user.roles[0] === 'ROLE_STUDENT')
        setRoute('student')
    }

  }, [user])



  return (
    <header className={cx("wrapper")}>
      {/* LOGO */}
      <Link to={(user == null) ? '/' : `/${route}`} className={cx("logo")}>
        <img
          src="https://actvn.edu.vn/Images/actvn_big_icon.png"
          alt="Logo"
        ></img>
        <div className={cx("text-logo")}>
          <h3>KHOA CÔNG NGHỆ THÔNG TIN</h3>
          <h4>Học viện Kỹ thuật Mật Mã</h4>
        </div>
      </Link>
      {/* SEARCH BAR */}
      <div className={cx("search-bar")}>
        <input placeholder="Nhập để tìm kiếm"></input>
      </div>




      {/* {user && user.role === 'admin' && <p>Đây là trang dành cho Admin!</p>}
      {user && user.role === 'student' && <p>Đây là trang dành cho Học Sinh!</p>}
      {user && user.role === 'staff' && <p>Đây là trang dành cho Nhân Viên!</p>} */}


      {user && <div className={cx("options")}>
        <i className="fa-regular fa-bell"></i>
        <i className="fa-regular fa-comment"></i>
        <Tippy
          interactive
          trigger="click"
          placement="bottom-end"
          render={attrs => (
            <div className="box" tabIndex="-1" {...attrs}>
              <div className={cx('user-menu')} tabIndex="-1" {...attrs}>
                <button className={cx('menu-item')}>Profile</button>
                <button className={cx('menu-item')}>Change Password</button>
                <button className={cx('menu-item')}>Setting</button>
                <button className={cx('menu-item')}>Feedback</button>
                <button className={cx('menu-item')} onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          )}
        >

          <img className={cx("avatar")} src={user.avaFileCode != undefined ? (api + user.avaFileCode) : "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"} alt=""></img>

        </Tippy>
      </div>}
    </header>
  );
}

export default Header;
