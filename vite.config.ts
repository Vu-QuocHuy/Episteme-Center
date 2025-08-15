import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Bundle splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'router-vendor': ['react-router-dom'],
          'utils-vendor': ['axios', 'date-fns'],

          // Feature chunks
          'admin-features': [
            './src/pages/admin/TeacherManagement.jsx',
            './src/pages/admin/StudentManagement.jsx',
            './src/pages/admin/ClassManagement.jsx',
            './src/pages/admin/ParentManagement.jsx',
          ],
          'teacher-features': [
            './src/pages/teacher/Dashboard.jsx',
            './src/pages/teacher/MyClasses.jsx',
            './src/pages/teacher/Schedule.jsx',
            './src/pages/teacher/Salary.jsx',
          ],
          'student-features': [
            './src/pages/student/Dashboard.jsx',
            './src/pages/student/MyClasses.jsx',
            './src/pages/student/Schedule.jsx',
          ],
          'parent-features': [
            './src/pages/parent/Dashboard.jsx',
            './src/pages/parent/Children.jsx',
            './src/pages/parent/Payments.jsx',
          ],

          // Common components
          'common-components': [
            './src/components/common/SearchInput.tsx',
            './src/components/common/StatusChip.tsx',
            './src/components/common/ActionButtons.tsx',
            './src/components/common/LoadingSpinner.tsx',
            './src/components/common/EmptyState.tsx',
            './src/components/common/LazyRoute.tsx',
            './src/components/common/FilterSelect.tsx',
            './src/components/common/DatePicker.tsx',
            './src/components/common/FileUpload.tsx',
            './src/components/common/Modal.tsx',
            './src/components/common/VirtualList.tsx',
          ],

          // Hooks
          'common-hooks': [
            './src/hooks/useDebounce.ts',
            './src/hooks/useServiceWorker.ts',
          ],
          'feature-hooks': [
            './src/hooks/features/useTeacherManagement.ts',
            './src/hooks/features/useTeacherForm.ts',
            './src/hooks/features/useStudentManagement.js',
            './src/hooks/features/useStudentForm.js',
            './src/hooks/features/useClassManagement.js',
            './src/hooks/features/useParentManagement.js',
            './src/hooks/features/useParentForm.js',
          ],
        },
      },
    },

    // Performance optimizations
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Source maps for production debugging
    sourcemap: false,

    // Assets optimization
    assetsInlineLimit: 4096,

    // CSS optimization
    cssCodeSplit: true,

    // Report bundle size
    reportCompressedSize: true,
  },

  // Development server optimization
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://eng-center-nestjs.onrender.com',
        changeOrigin: true,
        rewrite: (path) => '/api/v1' + path.replace(/^\/api/, ''),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },

  // Preview server
  preview: {
    port: 4173,
    open: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'react-router-dom',
      'axios',
      'date-fns',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded separately
    ],
  },

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },

  // Environment variables
  envPrefix: 'VITE_',
});
