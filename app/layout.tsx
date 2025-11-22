import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/app/private";
import Image from "next/image";

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

// helper to fetch school design for a slug
async function getSchoolDesign(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/schools/${slug}`,
      { cache: "no-store" } // always fetch latest
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("❌ Failed to load school design:", err);
    return null;
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug?: string };
}) {
  // get current slug from params (if using app/[slug]/ structure)
  const slug = params?.slug;
  const school = slug ? await getSchoolDesign(slug) : null;

  const bgImage = school?.background_url || "";
  const bgColor = school?.background_color || "#f5f5f5";
  const logoUrl = school?.logo_url || "";
  const logoText = school?.logo_text || "";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          minHeight: "100vh",
          backgroundColor: bgColor,
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Top bar with logo */}
        {slug && (
          <header className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md shadow-md">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt="School Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <h1 className="text-lg font-bold text-gray-800">
              {logoText || school?.name || "School System"}
            </h1>
          </header>
        )}

        <div className="relative z-10 min-h-[calc(100vh-60px)]">
          <UserProvider>{children}</UserProvider>
        </div>
      </body>
    </html>
  );
}
