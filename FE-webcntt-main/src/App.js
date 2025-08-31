import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { publicRoutes, privateRoutes } from "~/routes";
import { DefaultLayout } from "~/components/Layouts";
import { Fragment } from "react";
import ScrollToTop from "~/components/ScrollToTop";
import { AuthProvider } from "./Authentication/AuthContext";
import { useEffect } from "react";
import { ConfigProvider } from "antd";
import { createStyles } from "antd-style";
import { UserLayout } from "~/components/Layouts";

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));



function App() {
  const { styles } = useStyle();

  return (
    <AuthProvider>
      <ConfigProvider button={{
        className: styles.linearGradientButton,
      }}
      >
        <Router>
          <div className="App">
            <ScrollToTop></ScrollToTop>
            <Routes>
              {publicRoutes.map((route, index) => {
                let Layout = DefaultLayout;
                if (route.layout) {
                  Layout = route.layout;
                } else if (route.layout === null) {
                  Layout = Fragment;
                }
                const Element = route.component;
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <Layout>
                        <Element />
                      </Layout>
                    }
                  ></Route>
                );
              })}

              {privateRoutes.map((route, index) => {
                const userString = localStorage.getItem('user');
                const user = JSON.parse(userString);
                const userRole = user ? user.roles : null;
                let Layout = UserLayout;
                if (route.layout) {
                  Layout = route.layout;
                } else if (route.layout === null) {
                  Layout = Fragment;
                }
                const Element = route.component;
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={(
                      userString ? (
                        userRole.some(role => (route.allowedRole.includes(role))) ? (
                          <Layout>
                            <Element />
                          </Layout>
                        ) : (
                          <div>
                            <h2>Không có quyền truy cập</h2>
                            <p>Xin lỗi, bạn không có quyền truy cập vào trang này.</p>
                          </div>
                        )
                      ) : (
                        <Navigate to="/login" />
                      )
                    )}>
                  </Route>

                );
              })}
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;