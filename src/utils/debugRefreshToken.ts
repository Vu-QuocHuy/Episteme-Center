// Debug Refresh Token
export const debugRefreshToken = async () => {
  console.log('🔍 Debug Refresh Token...');

  // 1. Kiểm tra localStorage
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userData = localStorage.getItem('userData');

  console.log('📦 LocalStorage:');
  console.log('- access_token:', accessToken ? '✅ Có' : '❌ Không có');
  console.log('- refresh_token:', refreshToken ? '✅ Có' : '❌ Không có');
  console.log('- userData:', userData ? '✅ Có' : '❌ Không có');

  // 2. Kiểm tra cookies
  console.log('🍪 Cookies:');
  const cookies = document.cookie.split(';').map(c => c.trim());
  const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
  console.log('- refreshToken cookie:', refreshCookie ? '✅ Có' : '❌ Không có');
  console.log('- Tất cả cookies:', cookies);

  // 3. Test refresh API
  try {
    console.log('🔄 Testing refresh API...');
    const response = await fetch('/api/auth/refresh', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Refresh successful:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Refresh failed:', errorData);
    }
  } catch (error) {
    console.log('❌ Refresh API error:', error);
  }

  // 4. Test với axios
  try {
    console.log('🔄 Testing with axios...');
    const axios = (await import('axios')).default;
    const response = await axios.get('/api/auth/refresh');
    console.log('✅ Axios refresh successful:', response.data);
  } catch (error: any) {
    console.log('❌ Axios refresh failed:', error.response?.data || error.message);
  }
};

// Thêm vào window để test từ console
if (typeof window !== 'undefined') {
  (window as any).debugRefreshToken = debugRefreshToken;
  console.log('🔧 Debug function available: debugRefreshToken()');
}
