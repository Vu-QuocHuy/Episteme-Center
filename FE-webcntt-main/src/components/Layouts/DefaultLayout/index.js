import styles from './DefaultLayout.module.scss';
import classNames from "classnames/bind";
import Layout, { Content } from "antd/es/layout/layout";
import { Header } from "antd/es/layout/layout";
import { Button, ConfigProvider, Dropdown, Menu } from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "~/Authentication/AuthContext";
import { useEffect, useState } from 'react';
import { keyboard } from '@testing-library/user-event/dist/keyboard';
import { DownOutlined } from '@ant-design/icons';
import Footer from '~/pages/Home/components/Footer';

const cx = classNames.bind(styles)
const token = localStorage.getItem("auth_token");
const api = process.env.REACT_APP_API_URL;

const handleLogout = () => {
  localStorage.clear();
  fetch(api + "/user/logout", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  window.location.replace(`/`);
}

const avtitems = [
  {
    label: (
      <Link to={"/profile"}>Profile</Link>
    ),
    key: '1',
  },
  {
    label: (
      <Link to={"/changePassword"}>Change password</Link>
    ),
    key: '2',
  },
  {
    label: (
      <button style={{ all: 'unset', width: '100%', height: '100%' }} onClick={() => handleLogout()}>Sign Out</button>
    ),
    key: '3',
  }
]



function DefaultLayout({ children }) {
  const { user } = useAuth();
  const [route, setRoute] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [navItem, setNavItem] = useState([]);
  const url = api;

  const fetchNavItem = async () => {
    try {
      const response = await fetch(url + "/api/public/menu_items", {
        method: "GET",
      })

      const data = await response.json();
      if (!response.ok) {
        throw new Error("Cannot take navbar item from server")
      }
      setNavItem(data);

    } catch (error) {
      alert(error);
    }
  }

  useEffect(() => {
    if (user) {
      if (user.roles[0] === 'ROLE_ADMIN')
        setRoute("admin")
      else if (user.roles[0] === 'ROLE_EMPLOYEE')
        setRoute('employee')
      else if (user.roles[0] === 'ROLE_STUDENT')
        setRoute('student')
    }
    fetchNavItem();
  }, [user])

  const transformApiItems = (apiItems) => {
    return apiItems.filter(item => !item.deleted).map(item => {
      const transformedItem = {
        key: item.slug,
        label: <Link style={{ color: "#fff" }} to={`/${item.slug}`}>{item.title}</Link>,
      };

      if (item.children && item.children.length > 0) {
        transformedItem.children = transformApiItems(item.children);
      }

      return transformedItem;
    });
  };

  const items = [
    {
      key: 'home',
      label: (
        <Link to={(user == null) ? '/' : `/${route}`}>Trang chủ</Link>
      )
    },
    {
      key: 'info',
      label: (
        <div>Giới thiệu <DownOutlined style={{ fontSize: "10px" }} /></div>
      ),
      children: [
        {
          key: 'main-info',
          label: (
            <Link to={"/gioi-thieu-chung"}>Giới thiệu chung</Link>
          ),
        },
        {
          key: 'staff-list',
          label: (
            <Link to={"/introEmployee"}>Danh sách cán bộ</Link>
          )
        }
      ]
    },
    {
      key: 'posts',
      label: (
        <Link to={"/posts"}>Bài viết</Link>
      )
    },
    {
      key: 'events',
      label: (
        <Link to={"/events"}>Sự kiện</Link>
      )
    },
    {
      key: 'forum',
      label: (
        <Link to={"/kmaforum"}>Diễn đàn</Link>
      )
    },
    ...transformApiItems(navItem)
  ]

  return (
    <ConfigProvider theme={{
      components: {
        Menu: {
          /* here is your component tokens */
          itemColor: "white",
          itemHoverBg: "rgba(43, 116, 181, 0.69)",
          popupBg: "#282828",
          itemHoverColor: "white"
        },
      },
    }}>
      <Layout>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: "white"
          }}
        >
          <div className={cx('container')}>
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


            <div className={cx("search-box")}>
              <button className={cx("btn-search")}><i class="fas fa-search"></i></button>
              <input type="text" className={cx("input-search")} placeholder="Type to Search..." />
            </div>



            {user &&
              (<div className={cx("options")}>
                <i className="fa-regular fa-bell"></i>
                <i className="fa-regular fa-comment"></i>
                <Dropdown
                  menu={{
                    items: avtitems,
                  }}
                  placement="bottomRight"
                >
                  <img className={cx("avatar")} src={user.avaFileCode != undefined ? (api + user.avaFileCode) : "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"} alt=""></img>
                </Dropdown>

              </div>)
            }
          </div>
        </Header>

        <Content>
          <div style={{ background: "#282828" }} className={cx("navbar", { fixed: isFixed })}>
            <Menu
              mode="horizontal"
              className={cx("nav-menu")}
              items={items.map((item) => ({
                ...item,
                className: 'custom-menu-item',
                style: {
                  color: "white",
                  // margin: "0 2px",
                }
              }))}
              style={{
                minWidth: 0,
                background: "#282828",
                color: "white"
              }}
            >
            </Menu>
          </div>
          {children}
        </Content>
      </Layout>
      <Footer></Footer>
    </ConfigProvider>
  );
}

export default DefaultLayout;
