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

  return <button className="w-20 bg-white-600 border-2 border-black"
  onClick={handleLogout}>Logout</button>;
}
