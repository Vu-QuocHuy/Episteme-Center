import styles from './UserLayout.module.scss';
import classNames from "classnames/bind";
import Layout, { Content } from "antd/es/layout/layout";
import { Header } from "antd/es/layout/layout";
import { Button, Dropdown, Menu, theme } from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "~/Authentication/AuthContext";
import { useEffect, useState } from 'react';
import Sider from 'antd/es/layout/Sider';
import { UserOutlined, BookOutlined, CalendarOutlined, ReconciliationFilled, HomeFilled, TeamOutlined, InfoCircleOutlined, ToolOutlined } from '@ant-design/icons';
const cx = classNames.bind(styles)
const token = localStorage.getItem("auth_token")


const handleLogout = () => {
    localStorage.clear();
    fetch("http://localhost:8084/user/logout", {
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
            <button style={{ all: 'unset', width: '100%', height: '100%' }} onClick={() => handleLogout()}>Sign Out</button>
        ),
        key: '3',
    }
]


function UserLayout({ children }) {
    const { user } = useAuth();
    const [route, setRoute] = useState("");
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [isFixed, setIsFixed] = useState(false);
    useEffect(() => {
        if (user) {
            if (user.roles[0] === 'ROLE_ADMIN')
                setRoute("admin")
            else if (user.roles[0] === 'ROLE_EMPLOYEE')
                setRoute('employee')
            else if (user.roles[0] === 'ROLE_STUDENT')
                setRoute('student')
        }
        const handleScroll = () => {
            // Kiểm tra vị trí cuộn
            if (window.scrollY > 61) { // Thay 100 bằng vị trí bạn muốn
                setIsFixed(true);
            } else {
                setIsFixed(false);
            }
        };

        // Gắn sự kiện scroll
        window.addEventListener('scroll', handleScroll);

        // Gỡ bỏ sự kiện khi component unmount
        return () => window.removeEventListener('scroll', handleScroll);
    }, [user])
    const items = [
        {
            key: 'home',
            label: (
                <Link to={(user == null) ? '/' : `/${route}`}>Trang chủ</Link>
            ),
            icon: <HomeFilled />
        },
        {
            key: 'posts',
            label: 'Bài viết',
            icon: <BookOutlined />,
            children: [
                {
                    key: 'CRUDpost',
                    label: (
                        <Link to={"/posts"}>Các bài viết</Link>
                    )
                },
                {
                    key: 'createPost',
                    label: (
                        <Link to={"/createPost"}>Tạo bài viết</Link>
                    )
                },
                {
                    key: 'createLayout',
                    label: (
                        <Link to={"/createLayout/user"}>Tạo Layout</Link>
                    )
                }
            ]
        },
        {
            key: 'events',
            label: "Sự kiện",
            icon: <CalendarOutlined />,
            children: [
                {
                    key: "createEvent",
                    label: (
                        <Link to={"/createEvent/user"}>Tạo sự kiện</Link>
                    )
                },
                {
                    key: "allEvents",
                    label: (
                        <Link to={"/events/user"}>Tất cả sự kiện</Link>
                    ),
                }
            ]
        },
        {
            key: 'study',
            label: 'Đào tạo',
            icon: <ReconciliationFilled />,
            children: [
                {
                    key: 'studyRoad',
                    label: (
                        <Link to={"/studyRoad"}>Chương trình học</Link>
                    ),
                },
                {
                    key: 'studyDoc',
                    label: (
                        <Link to={"/coursedocument"}>Tài liệu học tập</Link>
                    )
                }
            ]
        },
        {
            key: 'userManagement',
            label: 'Quản lý người dùng',
            icon: <UserOutlined />,
            children: [
                {
                    key: 'student',
                    label: (
                        <Link to={"/studentmanagement"}>Sinh viên</Link>
                    )
                },
                {
                    key: 'employee',
                    label: (
                        <Link to={"/employeemanagement"}>Nhân viên</Link>
                    )
                }
            ]
        },
        {
            key: 'infoMana',
            label: 'Quản lý thông tin',
            icon: <InfoCircleOutlined></InfoCircleOutlined>,
            children: [
                {
                    key: 'createCv',
                    label: (
                        <Link to={"/createLayout/user"}>Tạo thông tin nhân viên</Link>
                    )
                }
            ]
        },
        {
            key: 'crudnav',
            label: (
                <Link to={"/crud-navbar"}>Quản lý Navbar</Link>
            ),
            icon: <ToolOutlined />
        },
        {
            key: 'forums',
            label: (
                "Forum"
            ),
            icon: <TeamOutlined />,
            children: [
                {
                    key: 'forum',
                    label: (
                        <Link to={"/kmaforum"}>KMA Forum</Link>
                    )
                },
                {
                    key: 'crforum',
                    label: (
                        <Link to={"/createDiscussion"}>Tạo bài thảo luận</Link>
                    )
                },
                {
                    key: 'cforum',
                    label: (
                        <Link to={"/pending"}>Duyệt bài thảo luận</Link>
                    )
                }
            ]
        }
    ]

    const [collapsed, setCollapsed] = useState(false);
    ;
    return (
        // <ConfigProvider theme={{
        //     components: {
        //         Menu: {
        //             /* here is your component tokens */
        //             itemColor: "#002c3e",
        //             itemHoverBg: "#F7F8F3",
        //         },
        //     },
        // }}>

        //     <Layout style={{
        //         minHeight: '100vh',
        //     }}>

        //         <Header>
        //             <div className={cx('container')}>
        //                 <Link to={(user == null) ? '/' : `/${route}`} className={cx("logo")}>
        //                     <img
        //                         src="https://actvn.edu.vn/Images/actvn_big_icon.png"
        //                         alt="Logo"
        //                     ></img>
        //                     <div className={cx("text-logo")}>
        //                         <h3>KHOA CÔNG NGHỆ THÔNG TIN</h3>
        //                         <h4>Học viện Kỹ thuật Mật Mã</h4>
        //                     </div>
        //                 </Link>

        //                 <div className={cx("search-box")}>
        //                     <button className={cx("btn-search")}><i class="fas fa-search"></i></button>
        //                     <input type="text" className={cx("input-search")} placeholder="Type to Search..." />
        //                 </div>


        //                 {!user && (
        //                     <div className={cx("options")}>
        //                         <Button type="primary" size="large" href='/login'>
        //                             Login
        //                         </Button>
        //                     </div>
        //                 )
        //                 }
        //                 {user &&
        //                     (<div className={cx("options")}>
        //                         <i className="fa-regular fa-bell"></i>
        //                         <i className="fa-regular fa-comment"></i>
        //                         <Dropdown
        //                             menu={{
        //                                 items: avtitems,
        //                             }}
        //                             placement="bottomRight"
        //                         >
        //                             <img className={cx("avatar")} src={user.avaFileCode != undefined ? ("http://localhost:8084" + user.avaFileCode) : "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"} alt=""></img>
        //                         </Dropdown>
        //                     </div>)
        //                 }
        //             </div>
        //         </Header>
        //         <Content style={{
        //             background: colorBgContainer,
        //         }}>
        //             <div style={{ background: "#F7F8F3" }} className={cx("navbar", { fixed: isFixed })}>
        //                 <Menu
        //                     mode="horizontal"
        //                     items={items.map((item) => ({
        //                         ...item,
        //                         className: 'custom-menu-item',
        //                         style: {
        //                             borderLeft: "1px solid #d9d9d9", // Viền bên trái
        //                             borderRight: "1px solid #d9d9d9",// Viền bên phải
        //                         }
        //                     }))}
        //                     style={{
        //                         minWidth: 0,
        //                         background: "#F7F8F3",
        //                     }}>
        //                 </Menu>
        //             </div>
        //             {children}
        //         </Content>

        //     </Layout>
        // </ConfigProvider>
        <Layout>
            <Header>
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


                    {!user && (
                        <div className={cx("options")}>
                            <Button type="primary" size="large" href='/login'>
                                Login
                            </Button>
                        </div>
                    )
                    }
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
                                <img className={cx("avatar")} src={user.avaFileCode != undefined ? ("http://localhost:8084" + user.avaFileCode) : "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"} alt=""></img>
                            </Dropdown>
                        </div>)
                    }
                </div>
            </Header>
            <Layout hasSider>
                <Sider
                    width={200}
                    style={{
                        background: colorBgContainer,
                        minHeight: "95vh"
                    }}
                    collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
                    theme='dark'

                >
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['home']}
                        defaultOpenKeys={['home']}
                        style={{
                            height: '100%',
                            borderRight: 0,
                        }}
                        items={items}
                    />
                </Sider>
                <Layout
                    style={{
                        padding: '0 24px 24px',
                    }}
                >
                    <Content
                        style={{
                            padding: 24,
                            margin: "24px 0",
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default UserLayout;
