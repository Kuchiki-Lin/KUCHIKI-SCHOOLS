"use client";

import { Card } from "antd";
import { useRouter } from "next/navigation";
import {
  BankOutlined,
  BookOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

export default function ChooseInstitutionPage() {
  const router = useRouter();

  const institutions = [
    {
      icon: <HomeOutlined />,
      title: "Small School",
      desc: "Perfect for academies or small institutions with one branch.",
      color: "text-blue-600",
      route: "/registration/small-school",
    },
    {
      icon: <BookOutlined />,
      title: "Primary School",
      desc: "Streamline management for teachers, parents, and learners.",
      color: "text-green-600",
      route: "/registration/primary",
    },
    {
      icon: <TeamOutlined />,
      title: "Grade/High School",
      desc: "Handle larger student groups, classes, and exams with ease.",
      color: "text-purple-600",
      route: "/registration/highschool",
    },
    {
      icon: <BankOutlined />,
      title: "University / College",
      desc: "Advanced tools for multiple departments and large campuses.",
      color: "text-yellow-600",
      route: "/institutions/uniregistration",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Choose Your Institution
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the type of school you want to set up. We’ll customize the
          system for your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {institutions.map((inst, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <Card
              hoverable
              onClick={() => router.push(inst.route)}
              className="rounded-2xl shadow-md border-none hover:shadow-xl transition cursor-pointer h-full flex flex-col items-center justify-center text-center p-6"
            >
              <div className={`text-5xl mb-4 ${inst.color}`}>{inst.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{inst.title}</h3>
              <p className="text-sm text-gray-600">{inst.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
