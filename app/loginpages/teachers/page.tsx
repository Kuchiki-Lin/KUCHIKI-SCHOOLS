
'use client';

import LoginForm from '@/app/components/loginForm';
import {useRouter} from 'next/navigation';

export default function TeachersLoginPage() {
    const router = useRouter()

const handleLogin = async (credentials: any) => {

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials:"include",
    body: JSON.stringify({
      ...credentials, 
      role:"teacher"
    }),
  })

  const data = await res.json()
  if (res.ok) {
    
    router.push(`/dashboards/${data.role}`) // e.g., /dashboard/student
  } else {
    console.log(data.error)
  }
}



  return <LoginForm title="Teachers Login" onLogin={handleLogin} />;
}
