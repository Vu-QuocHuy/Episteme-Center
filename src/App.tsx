import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';


// Import custom theme
import theme from './theme';

// Pages
import Home from './pages/home/InteractiveHome';
import Login from './pages/auth/Login';
import StaffLogin from './pages/auth/StaffLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import UnauthorizedAccess from './pages/auth/UnauthorizedAccess';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdvertisementManagement from './pages/admin/AdvertisementManagement';
import ClassManagement from './pages/admin/ClassManagement';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import ParentManagement from './pages/admin/ParentManagement';
import Statistics from './pages/admin/Statistics';
import FinancialStatistics from './pages/admin/FinancialStatistics';
import StudentStatistics from './pages/admin/StudentStatistics';


import MenuManagement from './pages/admin/MenuManagement';
import BannerManagement from './pages/admin/BannerManagement';
import AboutManagement from './pages/admin/AboutManagement';
import FeaturedTeachersManagement from './pages/admin/FeaturedTeachersManagement';
import TestimonialsManagement from './pages/admin/TestimonialsManagement';
import FooterManagement from './pages/admin/FooterManagement';
import AdminProfile from './pages/profile/AdminProfile';
import AuditLog from './pages/admin/AuditLog';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherMyClasses from './pages/teacher/MyClasses';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherProfile from './pages/profile/TeacherProfile';
import TeacherDetail from './pages/teacher/TeacherDetail';
import Salary from './pages/teacher/Salary';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentMyClasses from './pages/student/MyClasses';
import StudentSchedule from './pages/student/Schedule';
import StudentProfile from './pages/profile/StudentProfile';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import ParentChildren from './pages/parent/Children';
import ParentPayments from './pages/parent/Payments';
import ParentProfile from './pages/profile/ParentProfile';

import { USER_ROLES } from './constants';

// Dynamic Menu Pages
import DynamicMenuPage from './pages/DynamicMenuPage';
import LayoutBuilder from './pages/admin/LayoutBuilder';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Trang chủ chung - hiển thị khác nhau tùy trạng thái đăng nhập */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/admin/login" element={<Navigate to="/staff/login" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/unauthorized" element={<UnauthorizedAccess />} />

          {/* Dynamic Menu Routes */}
          <Route path="/:slug" element={<DynamicMenuPage />} />

                    <Route path="/profile" element={
            !user ? <Navigate to="/" replace /> : (
              <Navigate to={
                user.role === USER_ROLES.ADMIN ? "/admin/profile" :
                user.role === USER_ROLES.TEACHER ? "/teacher/profile" :
                user.role === USER_ROLES.STUDENT ? "/student/profile" :
                user.role === USER_ROLES.PARENT ? "/parent/profile" : "/"
              } replace />
            )
          } />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="advertisements" element={<AdvertisementManagement />} />
                    <Route path="classes" element={<ClassManagement />} />

                    {/* New user management routes */}
                    <Route path="users" element={<Navigate to="/admin/users/students" replace />} />
                    <Route path="users/students" element={<StudentManagement />} />
                    <Route path="users/teachers" element={<TeacherManagement />} />
                    <Route path="users/parents" element={<ParentManagement />} />

                    {/* Legacy routes with redirects for backward compatibility */}
                    <Route path="students" element={<Navigate to="/admin/users/students" replace />} />
                    <Route path="teachers" element={<Navigate to="/admin/users/teachers" replace />} />
                    <Route path="parents" element={<Navigate to="/admin/users/parents" replace />} />

                    <Route path="statistics" element={<Statistics />} />
                    <Route path="statistics/financial" element={<FinancialStatistics />} />
                    <Route path="statistics/students" element={<StudentStatistics />} />
                                          <Route path="audit-log" element={<AuditLog />} />

                      {/* Homepage Management Routes */}
                      <Route path="homepage" element={<Navigate to="/admin/homepage/banner" replace />} />
                      <Route path="homepage/banner" element={<BannerManagement />} />
                      <Route path="homepage/about" element={<AboutManagement />} />
                      <Route path="homepage/featured-teachers" element={<FeaturedTeachersManagement />} />
                      <Route path="homepage/testimonials" element={<TestimonialsManagement />} />
                      <Route path="homepage/footer" element={<FooterManagement />} />

                      <Route path="menu" element={<MenuManagement />} />
                     <Route path="menu-management" element={<MenuManagement />} />
                     <Route path="layout-builder/:slug" element={<LayoutBuilder />} />
                     <Route path="profile" element={<AdminProfile />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]}>
                    <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="classes" element={<TeacherMyClasses />} />
                    <Route path="schedule" element={<TeacherSchedule />} />
                    <Route path="salary" element={<Salary />} />
                    <Route path="profile" element={<TeacherProfile />} />
                    <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
                    </Routes>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]}>
                    <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="classes" element={<StudentMyClasses />} />
                    <Route path="schedule" element={<StudentSchedule />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                    </Routes>
                </ProtectedRoute>
              }
            />

            {/* Parent Routes */}
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
                    <Routes>
                    <Route path="dashboard" element={<ParentDashboard />} />
                    <Route path="children" element={<ParentChildren />} />
                    <Route path="payments" element={<ParentPayments />} />
                    <Route path="profile" element={<ParentProfile />} />
                    <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
                    </Routes>
                </ProtectedRoute>
              }
            />

            {/* Teacher Detail Route - Public (must be after all other routes) */}
            <Route path="/teacher/view/:slug" element={<TeacherDetail />} />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
