
'use client';

import LoginForm from '@/app/components/loginForm';
import {useRouter, useParams} from 'next/navigation';

export default function TeachersLoginPage() {
    const router = useRouter();
     const {slug} = useParams();

const handleLogin = async (credentials: any) => {

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials:"include",
    body: JSON.stringify({
      ...credentials, 
      role:"teacher",
      slug:slug,
    }),
  })

  const data = await res.json()
  if (res.ok) {
    
  router.push(`/dashboards/${slug}/${data.role}`);
  } else {
    console.log(data.error)
  }
}



  return(
    <div className='w-screen flex justify-center items-center
 h-screen '>

<LoginForm title="Teachers Login" onLogin={handleLogin} />;
 </div>
  )
  
  
}
