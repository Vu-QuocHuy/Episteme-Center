import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@teacher': path.resolve(__dirname, './src/components/features/teacher'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@config': path.resolve(__dirname, './src/config'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
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
            './src/pages/admin/TeacherManagement.tsx',
            './src/pages/admin/StudentManagement.tsx',
            './src/pages/admin/ClassManagement.tsx',
            './src/pages/admin/ParentManagement.tsx',
          ],
          'teacher-features': [
            './src/pages/teacher/Dashboard.tsx',
            './src/pages/teacher/MyClasses.tsx',
            './src/pages/teacher/Schedule.tsx',
            './src/pages/teacher/Salary.tsx',
          ],
          'student-features': [
            './src/pages/student/Dashboard.tsx',
            './src/pages/student/MyClasses.tsx',
            './src/pages/student/Schedule.tsx',
          ],
          'parent-features': [
            './src/pages/parent/Dashboard.tsx',
            './src/pages/parent/Children.tsx',
            './src/pages/parent/Payments.tsx',
          ],

          // Note: temporarily remove explicit common-components chunk to avoid init-order TDZ issues

          // Hooks
          'common-hooks': [
            './src/hooks/useDebounce.ts',
            './src/hooks/useServiceWorker.ts',
          ],
          'feature-hooks': [
            './src/hooks/features/useTeacherManagement.ts',
            './src/hooks/features/useTeacherForm.ts',
            './src/hooks/features/useStudentManagement.ts',
            './src/hooks/features/useStudentForm.ts',
            './src/hooks/features/useClassManagement.ts',
            './src/hooks/features/useParentManagement.ts',
            './src/hooks/features/useParentForm.ts',
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
    sourcemap: true,

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
            // ✅ Chỉ log lỗi nghiêm trọng, không log mọi request
            const errorCode = (err as any).code;
            if (errorCode !== 'ECONNRESET' && errorCode !== 'ETIMEDOUT') {
              console.error('Proxy error:', err);
            }
          });
          // ✅ Xóa các log request/response không cần thiết
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
