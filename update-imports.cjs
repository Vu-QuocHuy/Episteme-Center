const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'src/pages/teacher/TeacherDetail.tsx',
  'src/pages/teacher/Schedule.tsx',
  'src/pages/teacher/Salary.tsx',
  'src/pages/teacher/MyClasses.tsx',
  'src/pages/teacher/Dashboard.tsx',
  'src/pages/student/Schedule.tsx',
  'src/pages/student/MyClasses.tsx',
  'src/pages/student/Dashboard.tsx',
  'src/pages/profile/TeacherProfile.tsx',
  'src/pages/profile/StudentProfile.tsx',
  'src/pages/profile/ParentProfile.tsx',
  'src/pages/profile/AdminProfile.tsx',
  'src/pages/parent/Payments.tsx',
  'src/pages/parent/Dashboard.tsx',
  'src/pages/parent/Children.tsx',
  'src/pages/home/components/WelcomeAdPopup.tsx',
  'src/pages/home/components/BannerCarousel/index.tsx',
  'src/pages/auth/VerifyEmail.tsx',
  'src/pages/auth/ForgotPassword.tsx',
  'src/pages/admin/financial/tabs/TeacherPaymentsTab.tsx',
  'src/pages/admin/financial/tabs/StudentPaymentsTab.tsx',
  'src/pages/admin/financial/tabs/OtherTransactionsTab.tsx',
  'src/pages/admin/TestimonialsManagement.tsx',
  'src/pages/admin/StudentStatisticsPanel.tsx',
  'src/pages/admin/RoleManagement.tsx',
  'src/pages/admin/RegistrationManagement.tsx',
  'src/pages/admin/LayoutBuilder.tsx',
  'src/pages/admin/FooterManagement.tsx',
  'src/pages/admin/Dashboard.tsx',
  'src/pages/admin/ClassTeacherManagement.tsx',
  'src/pages/admin/ClassManagement.tsx',
  'src/pages/admin/ClassStudentManagement.tsx',
  'src/pages/admin/AuditLog.tsx',
  'src/pages/admin/ArticleManagement.tsx',
  'src/pages/admin/AdvertisementManagement.tsx',
  'src/pages/admin/AddStudentToClassDialog.tsx',
  'src/pages/MenuManagement/index.tsx',
  'src/pages/DynamicMenuPage.tsx',
  'src/hooks/features/useTeacherForm.ts',
  'src/hooks/features/useStudentForm.ts',
  'src/hooks/features/useParentManagement.ts',
  'src/hooks/features/useParentForm.ts',
  'src/hooks/features/useMenuItems.ts',
  'src/hooks/features/useClassManagement.ts',
  'src/components/features/teacher/ClassDetailModal.tsx',
  'src/components/features/teacher/AttendanceModal.tsx',
  'src/components/features/teacher/AttendanceHistoryModal.tsx',
  'src/components/features/student/StudentViewDialog.tsx',
  'src/components/features/parent/ParentViewDialog.tsx',
  'src/components/features/parent/ParentForm.tsx',
  'src/components/features/parent/ParentChildrenManager.tsx',
  'src/components/features/home/FeedbackHome.tsx',
  'src/components/features/home/FeaturedTeachersHome.tsx',
  'src/components/features/home/ConsultationRegistration.tsx',
  'src/components/features/class/ClassTable.tsx',
  'src/components/features/class/ClassFormUpdated.tsx',
  'src/components/features/class/AddTeacherToClassDialog.tsx',
  'src/components/features/class/AddStudentToClassDialog.tsx',
  'src/components/common/AvatarUpload.tsx'
];

// Import mappings
const importMappings = [
  {
    from: /from ['"]\.\.\/\.\.\/config\/api['"]/g,
    to: "from '../api'"
  },
  {
    from: /from ['"]\.\.\/config\/api['"]/g,
    to: "from '../api'"
  },
  {
    from: /from ['"]\.\.\/\.\.\/services\/api['"]/g,
    to: "from '../api/services'"
  },
  {
    from: /from ['"]\.\.\/services\/api['"]/g,
    to: "from '../api/services'"
  },
  {
    from: /from ['"]\.\.\/\.\.\/utils\/axios\.customize['"]/g,
    to: "from '../api'"
  },
  {
    from: /from ['"]\.\.\/utils\/axios\.customize['"]/g,
    to: "from '../api'"
  },
  {
    from: /from ['"]\.\.\/\.\.\/utils\/apiHelpers['"]/g,
    to: "from '../api'"
  },
  {
    from: /from ['"]\.\.\/utils\/apiHelpers['"]/g,
    to: "from '../api'"
  },
  {
    from: /from ['"]\.\.\/\.\.\/utils\/devApiTest['"]/g,
    to: "// Removed - no longer needed"
  },
  {
    from: /from ['"]\.\.\/utils\/devApiTest['"]/g,
    to: "// Removed - no longer needed"
  }
];

// Function to update a single file
function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Apply import mappings
    importMappings.forEach(mapping => {
      if (mapping.from.test(content)) {
        content = content.replace(mapping.from, mapping.to);
        hasChanges = true;
      }
    });

    // Update API calls
    const apiCallMappings = [
      // Auth
      { from: /loginUserAPI/g, to: 'api.auth.loginUser' },
      { from: /loginAdminAPI/g, to: 'api.auth.loginAdmin' },
      { from: /refreshTokenAPI/g, to: 'api.auth.refreshToken' },
      { from: /registerAPI/g, to: 'api.auth.register' },
      { from: /changePasswordAPI/g, to: 'api.auth.changePassword' },
      { from: /forgotPasswordAPI/g, to: 'api.auth.forgotPassword' },
      { from: /verifyCodeAPI/g, to: 'api.auth.verifyCode' },
      { from: /resetPasswordAPI/g, to: 'api.auth.resetPassword' },
      { from: /sendVerificationEmailAPI/g, to: 'api.auth.sendVerificationEmail' },
      { from: /verifyEmailAPI/g, to: 'api.auth.verifyEmail' },

      // Student
      { from: /getAllStudentsAPI/g, to: 'api.student.getAll' },
      { from: /getStudentByIdAPI/g, to: 'api.student.getById' },
      { from: /createStudentAPI/g, to: 'api.student.create' },
      { from: /updateStudentAPI/g, to: 'api.student.update' },
      { from: /deleteStudentAPI/g, to: 'api.student.delete' },
      { from: /getStudentScheduleAPI/g, to: 'api.student.getSchedule' },
      { from: /getStudentAttendanceAPI/g, to: 'api.student.getAttendance' },
      { from: /getMonthlyStudentChangeAPI/g, to: 'api.student.getMonthlyChanges' },

      // Teacher
      { from: /getAllTeachersAPI/g, to: 'api.teacher.getAll' },
      { from: /getTeacherByIdAPI/g, to: 'api.teacher.getById' },
      { from: /createTeacherAPI/g, to: 'api.teacher.create' },
      { from: /updateTeacherAPI/g, to: 'api.teacher.update' },
      { from: /deleteTeacherAPI/g, to: 'api.teacher.delete' },
      { from: /getTeacherScheduleAPI/g, to: 'api.teacher.getSchedule' },
      { from: /getMyClassesAPI/g, to: 'api.teacher.getMyClasses' },
      { from: /getTypicalTeachersAPI/g, to: 'api.teacher.getTypical' },
      { from: /getTeacherBySlugAPI/g, to: 'api.teacher.getBySlug' },
      { from: /getTypicalTeacherDetailAPI/g, to: 'api.teacher.getTypicalDetail' },

      // Class
      { from: /getAllClassesAPI/g, to: 'api.class.getAll' },
      { from: /getClassByIdAPI/g, to: 'api.class.getById' },
      { from: /createClassAPI/g, to: 'api.class.create' },
      { from: /updateClassAPI/g, to: 'api.class.update' },
      { from: /deleteClassAPI/g, to: 'api.class.delete' },
      { from: /assignTeacherAPI/g, to: 'api.class.assignTeacher' },
      { from: /unassignTeacherAPI/g, to: 'api.class.unassignTeacher' },
      { from: /getAvailableStudentsAPI/g, to: 'api.class.getAvailableStudents' },
      { from: /addStudentsToClassAPI/g, to: 'api.class.addStudents' },
      { from: /removeStudentsFromClassAPI/g, to: 'api.class.removeStudents' },
      { from: /getStudentsInClassAPI/g, to: 'api.class.getStudentsInClass' },
      { from: /enrollStudentAPI/g, to: 'api.class.addStudents' },
      { from: /removeStudentFromClassAPI/g, to: 'api.class.removeStudents' },

      // Parent
      { from: /getAllParentsAPI/g, to: 'api.parent.getAll' },
      { from: /getParentByIdAPI/g, to: 'api.parent.getById' },
      { from: /createParentAPI/g, to: 'api.parent.create' },
      { from: /updateParentAPI/g, to: 'api.parent.update' },
      { from: /deleteParentAPI/g, to: 'api.parent.delete' },
      { from: /addChildToParentAPI/g, to: 'api.parent.addChild' },
      { from: /removeChildFromParentAPI/g, to: 'api.parent.removeChild' },
      { from: /payTuitionFeeAPI/g, to: 'api.parent.payTuitionFee' },
      { from: /getParentChildrenAPI/g, to: 'api.parent.getById' },
      { from: /addChildAPI/g, to: 'api.parent.addChild' },
      { from: /removeChildAPI/g, to: 'api.parent.removeChild' },
      { from: /payTuitionAPI/g, to: 'api.parent.payTuitionFee' },

      // Session/Attendance
      { from: /getTodaySessionAPI/g, to: 'api.session.getToday' },
      { from: /updateSessionAttendanceAPI/g, to: 'api.session.updateAttendance' },
      { from: /getSessionsByClassAPI/g, to: 'api.session.getByClass' },
      { from: /getSessionsByStudentAPI/g, to: 'api.session.getByStudent' },
      { from: /getTodayAttendanceAPI/g, to: 'api.session.getToday' },
      { from: /updateAttendanceAPI/g, to: 'api.session.updateAttendance' },
      { from: /getAttendanceListAPI/g, to: 'api.session.getAttendanceList' },
      { from: /getAttendanceByIdAPI/g, to: 'api.session.getAttendanceById' },

      // Payment
      { from: /getAllPaymentsAPI/g, to: 'api.payment.getAll' },
      { from: /payStudentAPI/g, to: 'api.payment.payStudent' },
      { from: /getAllTeacherPaymentsAPI/g, to: 'api.payment.getTeacherPayments' },
      { from: /updateTeacherPaymentAPI/g, to: 'api.payment.updateTeacherPayment' },
      { from: /getTeacherPaymentsAPI/g, to: 'api.payment.getTeacherPayments' },
      { from: /getPaymentsAPI/g, to: 'api.payment.getAll' },
      { from: /getTotalPaymentsAPI/g, to: 'api.payment.getTotal' },
      { from: /getPaymentsByStudentAPI/g, to: 'api.payment.getByStudent' },
      { from: /exportPaymentsReportAPI/g, to: 'api.payment.exportReport' },
      { from: /payTeacherAPI/g, to: 'api.payment.payTeacher' },
      { from: /getTeacherPaymentByIdAPI/g, to: 'api.payment.getTeacherPaymentById' },
      { from: /exportTeacherPaymentsReportAPI/g, to: 'api.payment.exportTeacherReport' },

      // Dashboard
      { from: /getAdminDashboardAPI/g, to: 'api.dashboard.getAdmin' },
      { from: /getTeacherDashboardAPI/g, to: 'api.dashboard.getTeacher' },
      { from: /getParentDashboardAPI/g, to: 'api.dashboard.getParent' },
      { from: /getStudentDashboardAPI/g, to: 'api.dashboard.getStudent' },

      // Content
      { from: /createAnnouncementAPI/g, to: 'api.content.announcements.create' },
      { from: /getAllAnnouncementsAPI/g, to: 'api.content.announcements.getAll' },
      { from: /getAnnouncementByIdAPI/g, to: 'api.content.announcements.getById' },
      { from: /updateAnnouncementAPI/g, to: 'api.content.announcements.update' },
      { from: /deleteAnnouncementAPI/g, to: 'api.content.announcements.delete' },
      { from: /createAdvertisementAPI/g, to: 'api.content.advertisements.create' },
      { from: /getAdvertisementsAPI/g, to: 'api.content.advertisements.getAll' },
      { from: /getHomeBannersAPI/g, to: 'api.content.advertisements.getBanners' },
      { from: /getHomePopupAPI/g, to: 'api.content.advertisements.getPopup' },
      { from: /getAdvertisementByIdAPI/g, to: 'api.content.advertisements.getById' },
      { from: /updateAdvertisementAPI/g, to: 'api.content.advertisements.update' },
      { from: /deleteAdvertisementAPI/g, to: 'api.content.advertisements.delete' },
      { from: /createFeedbackAPI/g, to: 'api.content.feedback.create' },
      { from: /getFeedbacksAPI/g, to: 'api.content.feedback.getAll' },
      { from: /getFeedbackByIdAPI/g, to: 'api.content.feedback.getById' },
      { from: /updateFeedbackAPI/g, to: 'api.content.feedback.update' },
      { from: /deleteFeedbackAPI/g, to: 'api.content.feedback.delete' },

      // File
      { from: /uploadFileAPI/g, to: 'api.file.upload' },
      { from: /deleteFileAPI/g, to: 'api.file.delete' },

      // Menu
      { from: /createMenuAPI/g, to: 'api.menu.create' },
      { from: /getAllMenusAPI/g, to: 'api.menu.getAll' },
      { from: /getMenuByIdAPI/g, to: 'api.menu.getById' },
      { from: /getMenuBySlugAPI/g, to: 'api.menu.getBySlug' },
      { from: /updateMenuAPI/g, to: 'api.menu.update' },
      { from: /deleteMenuAPI/g, to: 'api.menu.delete' },
      { from: /toggleMenuVisibilityAPI/g, to: 'api.menu.toggleVisibility' },

      // Article
      { from: /createArticleAPI/g, to: 'api.article.create' },
      { from: /getAllArticlesAPI/g, to: 'api.article.getAll' },
      { from: /getArticleByIdAPI/g, to: 'api.article.getById' },
      { from: /updateArticleAPI/g, to: 'api.article.update' },
      { from: /deleteArticleAPI/g, to: 'api.article.delete' },
      { from: /getArticlesByMenuIdAPI/g, to: 'api.article.getByMenuId' },
      { from: /getArticlesByMenuSlugAPI/g, to: 'api.article.getByMenuSlug' },

      // Transaction
      { from: /createTransactionAPI/g, to: 'api.transaction.create' },
      { from: /getAllTransactionsAPI/g, to: 'api.transaction.getAll' },
      { from: /getTransactionByIdAPI/g, to: 'api.transaction.getById' },
      { from: /updateTransactionAPI/g, to: 'api.transaction.update' },
      { from: /deleteTransactionAPI/g, to: 'api.transaction.delete' },
      { from: /exportTransactionsReportAPI/g, to: 'api.transaction.exportReport' },
      { from: /createTransactionCategoryAPI/g, to: 'api.transactionCategory.create' },
      { from: /getAllTransactionCategoriesAPI/g, to: 'api.transactionCategory.getAll' },
      { from: /getTransactionCategoryByIdAPI/g, to: 'api.transactionCategory.getById' },
      { from: /updateTransactionCategoryAPI/g, to: 'api.transactionCategory.update' },
      { from: /deleteTransactionCategoryAPI/g, to: 'api.transactionCategory.delete' },

      // Registration
      { from: /createRegistrationAPI/g, to: 'api.registration.create' },
      { from: /getAllRegistrationsAPI/g, to: 'api.registration.getAll' },
      { from: /getRegistrationByIdAPI/g, to: 'api.registration.getById' },
      { from: /updateRegistrationAPI/g, to: 'api.registration.update' },
      { from: /deleteRegistrationAPI/g, to: 'api.registration.delete' },

      // Role & Permission
      { from: /getAllRolesAPI/g, to: 'api.role.getAll' },
      { from: /getRoleByIdAPI/g, to: 'api.role.getById' },
      { from: /createRoleAPI/g, to: 'api.role.create' },
      { from: /updateRoleAPI/g, to: 'api.role.update' },
      { from: /deleteRoleAPI/g, to: 'api.role.delete' },
      { from: /getAllPermissionsAPI/g, to: 'api.permission.getAll' },

      // Audit
      { from: /getAuditLogsAPI/g, to: 'api.audit.getLogs' },

      // Schedule
      { from: /getLoggedInStudentSchedule/g, to: 'api.schedule.getStudentSchedule' },

      // User
      { from: /getUserByIdAPI/g, to: 'api.user.getById' },
      { from: /updateUserAPI/g, to: 'api.user.update' },
      { from: /uploadAvatarAPI/g, to: 'api.user.uploadAvatar' }
    ];

    // Apply API call mappings
    apiCallMappings.forEach(mapping => {
      if (mapping.from.test(content)) {
        content = content.replace(mapping.from, mapping.to);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update all files
console.log('🔄 Updating imports and API calls...\n');

let updatedCount = 0;
let errorCount = 0;

filesToUpdate.forEach(filePath => {
  try {
    updateFile(filePath);
    updatedCount++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Files processed: ${updatedCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`🎉 Import update completed!`);
