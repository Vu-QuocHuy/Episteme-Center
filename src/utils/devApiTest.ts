// Development API testing utilities
export const testAPI = async () => {
  if (import.meta.env.PROD) {
    console.warn('testAPI is only available in development');
    return;
  }

  console.log('🧪 Testing API connections...');

  try {
    // Test proxy connection
    console.log('Testing proxy endpoint...');
    const proxyResponse = await fetch('/api/');
    console.log('Proxy response:', proxyResponse.status, await proxyResponse.text());
  } catch (err) {
    console.error('Proxy test failed:', err);
  }

  try {
    // Test direct connection
    console.log('Testing direct endpoint...');
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://103.199.18.103:8080/api/v1';
    const directResponse = await fetch(apiUrl);
    console.log('Direct response:', directResponse.status, await directResponse.text());
  } catch (err) {
    console.error('Direct test failed:', err);
  }

  try {
    // Test admin login endpoint through proxy
    console.log('Testing admin login endpoint...');
    const loginResponse = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@gmail.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.text();
    console.log('Admin login test:', loginResponse.status, loginData);
  } catch (err) {
    console.error('Admin login test failed:', err);
  }
};

// Add to global scope for dev console access
if (import.meta.env.DEV) {
  (window as any).testAPI = testAPI;
  console.log('🔧 Dev API tester loaded: testAPI()');
}
