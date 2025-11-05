// Test helpers for development
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@gmail.com',
    password: 'password123'
  },
  user: {
    email: 'user@gmail.com',
    password: 'password123'
  },
  teacher: {
    email: 'teacher@gmail.com',
    password: 'password123'
  },
  student: {
    email: 'student@gmail.com',
    password: 'password123'
  },
  parent: {
    email: 'parent@gmail.com',
    password: 'password123'
  }
};

// Quick fill function for development
export const quickFillLoginForm = (role: keyof typeof TEST_CREDENTIALS = 'admin') => {
  const credentials = TEST_CREDENTIALS[role];

  setTimeout(() => {
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;

    if (emailInput && passwordInput) {
      emailInput.value = credentials.email;
      passwordInput.value = credentials.password;

      // Trigger events to update React state
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, 100);
};

// Test refresh token functionality
export const testRefreshToken = async () => {
  try {
    console.log('🔄 Testing refresh token...');
    const response = await fetch('/api/auth/refresh', {
      method: 'GET',
      credentials: 'include', // Send cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('✅ Refresh token response:', data);

    if (data.statusCode === 200 && data.data?.access_token) {
      console.log('✅ Refresh token successful');
      localStorage.setItem('access_token', data.data.access_token);
      if (data.data.user) {
        localStorage.setItem('userData', JSON.stringify(data.data.user));
      }
    } else {
      console.log('❌ Refresh token failed:', data);
    }
  } catch (error) {
    console.error('❌ Refresh token test error:', error);
  }
};

// Add to global scope for dev console access
if (process.env.NODE_ENV === 'development') {
  (window as any).quickFill = quickFillLoginForm;
  (window as any).testCreds = TEST_CREDENTIALS;
  (window as any).testRefreshToken = testRefreshToken;

  console.log('🔧 Dev helpers loaded:');
  console.log('- quickFill(role) - Auto fill login form');
  console.log('- testCreds - View test credentials');
  console.log('- testRefreshToken() - Test refresh token API');
  console.log('Available roles:', Object.keys(TEST_CREDENTIALS));
}
