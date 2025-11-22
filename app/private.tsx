
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: number;
  fullname: string;
  role: string;
  department: string;
  dbSlug: string;
  logo_url: string;
  background_url: string;
  theme_template: string;
  logo_text: string;
  background_color: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
      setUser({
  id: data.id,
  fullname: data.fullname,
  role: data.role,
  department: data.department,
  dbSlug: data.dbSlug,
  logo_url: data.logo_url,
  background_url: data.background_url,
  theme_template: data.theme_template,
  logo_text: data.logo_text,
  background_color: data.background_color,
});

      }
    };

    fetchUser();
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

