"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, } from "react";
import { Card, Button, Typography, Space, message, Spin, Empty } from "antd";
import {
  CopyOutlined,
  LoginOutlined,
  SwapOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  BookOutlined,
  DollarOutlined,
  BarChartOutlined,
  CalendarOutlined,
  SettingOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

import LogoutButton from "@/app/logout";
import { useUser } from "@/app/private";

const { Title, Text } = Typography;

// Types
type Course = {
  name: string;
  code: string;
};
type Student = {
  id: number;
  fullname: string;
  department: string;
  courses: Course[];
};
type TeacherCourse = {
  name: string;
  code: string;
  student_count: number;
};
type Teacher = {
  id: number;
  fullname: string;
  department: string;
  courses: TeacherCourse[];
};

export default function Dashboard() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
 
  const [view, setView] = useState<"school" | "admin">("school");

  // slug for school dashboard
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam ?? "";
  
  const cleanSlug = slug.split("-")[0];
  console.log(cleanSlug);

  // admin dashboard state
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (view === "admin") {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const studentsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/${slug}/students/detailed`
          );
          const teachersRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/${slug}/teachers/detailed`
          );

          if (!studentsRes.ok || !teachersRes.ok) {
            throw new Error("Failed to fetch data");
          }

          // fallback to empty array if response is not valid
          const studentsData: Student[] = (await studentsRes.json()) || [];
          const teachersData: Teacher[] = (await teachersRes.json()) || [];

          setTotalStudents(studentsData.length);
          setTotalTeachers(teachersData.length);

          // departments
          const allDepartments = new Set<string>();
          (studentsData || []).forEach((s) => allDepartments.add(s.department));
          (teachersData || []).forEach((t) => allDepartments.add(t.department));
          setTotalDepartments(allDepartments.size);

          // courses
          const allCourses = new Set<string>();
          (studentsData || []).forEach((s) =>
            s.courses.forEach((c) => allCourses.add(c.code))
          );
          (teachersData || []).forEach((t) =>
            t.courses.forEach((c) => allCourses.add(c.code))
          );
          setTotalCourses(allCourses.size);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [view, slug]);

  // 🔗 Links for school dashboard
  const studentRegistration = `${process.env.NEXT_PUBLIC_URL}/registrationpages/${slug}/students`;
  const teacherRegistration = `${process.env.NEXT_PUBLIC_URL}/registrationpages/${slug}/teachers`;
  const studentLogin = `${process.env.NEXT_PUBLIC_URL}/loginpages/${slug}/students`;
  const teacherLogin = `${process.env.NEXT_PUBLIC_URL}/loginpages/${slug}/teachers`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Link copied!");
  };

  return (
    <main className="min-h-screen px-4 py-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Toggle Button */}
        <div className="flex justify-end mb-6">
          <Button
            icon={<SwapOutlined />}
            onClick={() => setView(view === "school" ? "admin" : "school")}
          >
            Switch to{" "}
            {view === "school" ? "Admin Dashboard" : "School Dashboard"}
          </Button>
        </div>

        {view === "school" ? (
          // ================= SCHOOL DASHBOARD =================
          <Card className="rounded-3xl shadow-xl backdrop-blur-md bg-white/80 border border-white/40 p-6">
            <Title level={2} className="text-center text-green-700">
              {cleanSlug ? `🏫 ${cleanSlug.toUpperCase()}` : "🏫 SCHOOL"}
            </Title>
            <Text className="block text-center text-gray-600 mb-6">
              Manage your school and share registration & login links
            </Text>

            <Space direction="vertical" size="large" className="w-full">
              {/* Registration Links */}
              <Card title="Registration Links" className="rounded-xl shadow">
                <div className="flex justify-between items-center">
                  <Text strong>Student Registration:</Text>
                  <Space>
                    <Text copyable>{studentRegistration}</Text>
                    <Button
                      type="primary"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(studentRegistration)}
                    >
                      Copy
                    </Button>
                  </Space>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Text strong>Teacher Registration:</Text>
                  <Space>
                    <Text copyable>{teacherRegistration}</Text>
                    <Button
                      type="primary"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(teacherRegistration)}
                    >
                      Copy
                    </Button>
                  </Space>
                </div>
              </Card>

              {/* Login Links */}
              <Card title="Login Links" className="rounded-xl shadow">
                <div className="flex justify-between items-center">
                  <Text strong>Student Login:</Text>
                  <Space>
                    <Text copyable>{studentLogin}</Text>
                    <Button
                      type="dashed"
                      icon={<LoginOutlined />}
                      onClick={() => copyToClipboard(studentLogin)}
                    >
                      Copy
                    </Button>
                  </Space>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Text strong>Teacher Login:</Text>
                  <Space>
                    <Text copyable>{teacherLogin}</Text>
                    <Button
                      type="dashed"
                      icon={<LoginOutlined />}
                      onClick={() => copyToClipboard(teacherLogin)}
                    >
                      Copy
                    </Button>
                  </Space>
                </div>
              </Card>

              {/* Management */}
              <Card title="Manage School" className="rounded-xl shadow">
                <Space direction="vertical" size="middle" className="w-full">
                  <button  onClick={()=>{
                    console.log("bankai");
                    router.push(`/institutions/${slug}/setup`)
                  }}  >Update School Details</button>
                  <Button block>Change Password</Button>
                  <Button block>Change Logo / Background</Button>
                </Space>
              </Card>
            </Space>
          </Card>
        ) : (
          // ================= ADMIN DASHBOARD =================
          <div>
            <header className="flex justify-between items-center rounded-xl shadow-lg px-6 py-4 mb-10 bg-white backdrop-blur-sm">
              <h2 className="font-bold text-4xl">Admin Portal</h2>
              <div className="text-right space-y-1">
                <p className="px-3 py-1 rounded-lg shadow bg-gray-100">
                  {user?.fullname}
                </p>
                <p className="px-3 py-1 rounded-lg shadow bg-gray-100">
                  System Administrator
                </p>
              </div>
            </header>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Spin size="large" tip="Loading dashboard insights..." />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-96">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-red-500 text-lg">
                      Error: {error} <br /> Please refresh.
                    </span>
                  }
                />
              </div>
            ) : (
              <>
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="p-4 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <UserOutlined className="text-blue-600" />
                      Students
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <TeamOutlined className="text-green-600" />
                      Teachers
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">
                      {totalTeachers}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <BankOutlined className="text-red-600" />
                      Departments
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">
                      {totalDepartments}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <BookOutlined className="text-indigo-600" />
                      Courses
                    </h3>
                    <p className="text-4xl font-bold text-gray-800">
                      {totalCourses}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Card className="rounded-xl shadow-md p-6 hover:-translate-y-1">
                    <h3 className="text-xl font-bold mb-2">Manage Students</h3>
                    <button
                      onClick={() =>
                        router.push(`/${slug}/allaccounts/students`)
                      }
                      className="w-full bg-black/10 rounded-2xl py-2"
                    >
                      Go to Students <ArrowRightOutlined />
                    </button>
                  </Card>
                  <Card className="rounded-xl shadow-md p-6 hover:-translate-y-1">
                    <h3 className="text-xl font-bold mb-2">Manage Teachers</h3>
                    <button
                      onClick={() =>
                        router.push(`/${slug}/allaccounts/teachers`)
                      }
                      className="w-full bg-black/10 rounded-2xl py-2"
                    >
                      Go to Teachers <ArrowRightOutlined />
                    </button>
                  </Card>
                  <Card className="rounded-xl shadow-md p-6 hover:-translate-y-1">
                    <h3 className="text-xl font-bold mb-2">Finance</h3>
                    <button
                      onClick={() => router.push("/finance")}
                      className="w-full bg-black/10 rounded-2xl py-2"
                    >
                      Go to Finance <DollarOutlined />
                    </button>
                  </Card>
                </div>
              </>
            )}

            {/* Logout */}
            <footer className="flex justify-center mt-16">
              <LogoutButton />
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
