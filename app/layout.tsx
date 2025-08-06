import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@/app/private';
import Link from "next/link";


export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "SYSTEMS",
  description: "Kuchiki Systems",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` bg-gradient-to-br from-green-800 to-green-900  ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      
          
        <UserProvider>
        {children}
        </UserProvider>
      </body>
    </html>
  );
}
