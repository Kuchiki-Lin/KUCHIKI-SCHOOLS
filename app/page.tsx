"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Card } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ThreeBackground from "@/app/components/three";

export default function HomePage(): JSX.Element {
  const router = useRouter();
  const [heroIsUnderHeader, setHeroIsUnderHeader] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Dynamic Lando Norris scroll color effect
  useEffect(() => {
    const header = document.getElementById("main-header");
    if (!heroRef.current || !header) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroIsUnderHeader(!entry.isIntersecting); // text under header = true
      },
      { threshold: 0.6 }
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <BookOutlined />,
      title: "Course & Exam Management",
      desc: "Schedule classes, CATS, and exams with ease.",
      color: "text-blue-500",
    },
    {
      icon: <TeamOutlined />,
      title: "Teacher Tools",
      desc: "Track student progress, assignments, and attendance.",
      color: "text-green-500",
    },
    {
      icon: <DollarOutlined />,
      title: "Finance Management",
      desc: "Simplify fee collection and reporting.",
      color: "text-yellow-500",
    },
    {
      icon: <BarChartOutlined />,
      title: "Analytics & Reports",
      desc: "Insights for admins at every level.",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      {/* Background 3D Particles */}
      <div className="absolute inset-0 -z-10">
        <ThreeBackground />
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center min-h-screen relative overflow-hidden bg-transparent">
        {/* Header */}
<header
  id="main-header"
  className="backdrop-blur-sm  w-full shadow-sm px-6 flex justify-between items-center z-50 fixed top-0 left-0"
>
<h1 className="text-3xl font-[cursive] bg-gradient-to-r from-[#FFD700] to-[#FFB800] bg-clip-text text-transparent drop-shadow-lg">
  Kuchiki
</h1>
</header>



        {/* Hero Section */}
        <section className="relative w-full text-center py-4 md:py-32 px-6 overflow-hidden mt-16">
          {/* Glow Background */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-10 -z-10" />

          {/* ⭐ This wrapper detects when text goes under header ⭐ */}
   <div
  ref={heroRef}
  className={`transition-all duration-500 ${
    heroIsUnderHeader ? "brightness-110" : "brightness-100"
  }`}
>
  <motion.h1
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className={`md:text-4xl font-extrabold tracking-tight transition-colors duration-500 drop-shadow-lg
      ${
        heroIsUnderHeader
          ? "text-white"
          : "text-gray-900"
      }
    `}
    style={{
      textShadow: heroIsUnderHeader
        ? "0px 0px 16px rgba(255,255,255,0.7)"
        : "0px 0px 6px rgba(0,0,0,0.15)",
      transition: "text-shadow 0.5s ease",
    }}
  >
    Smart School Management <br className="hidden md:block" /> Made Simple
  </motion.h1>

  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.2 }}
    className={`max-w-3xl mx-auto mb-10 text-lg md:text-xl transition-colors duration-500
      ${
        heroIsUnderHeader
          ? "text-white/80"
          : "text-gray-700"
      }
    `}
  >
    From universities to primary schools, manage students, teachers,
    classes, and finances — all in one intuitive platform.
  </motion.p>
</div>


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Button
              onClick={() => router.push("/institutions/home")}
              type="primary"
              size="large"
              className="rounded-full px-8 py-6 text-base font-semibold transition-transform duration-300 hover:scale-105"
            >
              Get Started
            </Button>
            <Button
              size="large"
              className="rounded-full px-8 py-6 text-base font-semibold transition-transform duration-300 hover:scale-105"
            >
              See Demo
            </Button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl w-full py-20 px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="rounded-2xl shadow-xl border-2 border-gray-100 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl bg-white/80 backdrop-blur-xl">
                <div className={`text-4xl mb-4 ${f.color}`}>{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Audience */}
        <section className="w-full py-20 px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Built for Every School
          </h2>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <Card className="p-8 rounded-2xl shadow-xl border-2 border-gray-100 hover:shadow-2xl transition duration-300 bg-white/80 backdrop-blur-xl">
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Universities & Colleges
              </h3>
              <p className="mb-6">
                Scalable features for large institutions with multiple
                departments and thousands of students.
              </p>
              <Button
                size="large"
                className="rounded-lg px-6 py-4 font-medium transition-transform hover:scale-105"
              >
                Learn More
              </Button>
            </Card>

            <Card className="p-8 rounded-2xl shadow-xl border-2 border-gray-100 hover:shadow-2xl transition duration-300 bg-white/80 backdrop-blur-xl">
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                High Schools & Primary Schools
              </h3>
              <p className="mb-6">
                Simple tools designed for teachers, parents, and administrators
                to stay connected.
              </p>
              <Button
                size="large"
                className="rounded-lg px-6 py-4 font-medium transition-transform hover:scale-105"
              >
                Learn More
              </Button>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-8 bg-gray-50/70 backdrop-blur-xl">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Kuchiki School System. All rights
            reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
