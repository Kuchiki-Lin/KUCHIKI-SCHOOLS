'use client';

import LoginForm from '@/app/components/loginForm';

export default function adminLoginPage() {
  const handleLogin = async (values: any) => {
    console.log('Main-Admin login', values);
    // Validate against backend
  };

  return <LoginForm title="Main-Admin" onLogin={handleLogin} />;
}
