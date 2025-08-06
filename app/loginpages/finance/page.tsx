
'use client';

import LoginForm from '@/app/components/loginForm';

export default function FinanceLoginPage() {
  const handleLogin = async (values: any) => {
    console.log('Finance login', values);
    // Validate against backend
  };

  return <LoginForm title="Finance Login" onLogin={handleLogin} />;
}
