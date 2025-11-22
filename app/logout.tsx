"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: 'GET',
      credentials: 'include',
    });

    if (res.ok) {
      router.push("/");
    } else {
      console.error("Logout failed");
    }
  };

  return <button className="p-2 border-2 bg-black/15 hover:bg-red-100 rounded-2xl"
  style={{fontFamily:"cursive"}}
  onClick={handleLogout}
 
  >LOGOUT</button>;
}
