"use client";

import { useEffect, useState } from "react";
import { Card, Statistic, Spin, Empty, Button } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  BookOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import router, { useRouter } from "next/navigation";

// Define types for data fetched from APIs
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

export default function AdminDashboardPage() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter()



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch student data
        const studentsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/students/detailed`
        );
        if (!studentsRes.ok) {
          throw new Error(`HTTP error! status: ${studentsRes.status} for students data`);
        }
        const studentsData: Student[] = await studentsRes.json();
        setTotalStudents(studentsData.length);

        // Fetch teacher data
        const teachersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teachers/detailed`
        );
        if (!teachersRes.ok) {
          throw new Error(`HTTP error! status: ${teachersRes.status} for teachers data`);
        }
        const teachersData: Teacher[] = await teachersRes.json();
        setTotalTeachers(teachersData.length);

        // Calculate unique departments
        const allDepartments = new Set<string>();
        studentsData.forEach((s) => allDepartments.add(s.department));
        teachersData.forEach((t) => allDepartments.add(t.department));
        setTotalDepartments(allDepartments.size);

        // Calculate unique courses
        const allCourses = new Set<string>();
        studentsData.forEach((s) =>
          s.courses.forEach((c) => allCourses.add(c.code))
        );
        teachersData.forEach((t) =>
          t.courses.forEach((c) => allCourses.add(c.code))
        );
        setTotalCourses(allCourses.size);
      } catch (err: any) {
        console.error("Dashboard data fetch error:", err);
        setError(err.message || "Failed to load dashboard data.");
        // Reset counts on error
        setTotalStudents(0);
        setTotalTeachers(0);
        setTotalDepartments(0);
        setTotalCourses(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="text-center mb-12 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200">
          <DashboardOutlined className="text-blue-600 text-5xl mb-4 animate-bounce" />
          
          <p className="text-lg max-w-2xl mx-auto">
             Quick overview of your institution and access key management tools.
          </p>
        </div>

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
                  Error: {error} <br /> Please try refreshing the page.
                </span>
              }
            />
          </div>
        ) : (
          <>
            {/* Key Metrics Section */}
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Key Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Total Students Card */}
              <Card
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 border-b-4 border-purple-500"
              >
                <Statistic
                  title="Total Students"
                  value={totalStudents}
                  prefix={<UserOutlined className="text-purple-500 text-2xl" />}
                  valueStyle={{ color: '#8B5CF6', fontSize: '2.5rem' }}
                />
                <p className="text-gray-500 text-sm mt-2">Enrolled learners</p>
              </Card>

              {/* Total Teachers Card */}
              <Card
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 border-b-4 border-green-500"
              >
                <Statistic
                  title="Total Teachers"
                  value={totalTeachers}
                  prefix={<TeamOutlined className="text-green-500 text-2xl" />}
                  valueStyle={{ color: '#10B981', fontSize: '2.5rem' }}
                />
                <p className="text-gray-500 text-sm mt-2">Dedicated educators</p>
              </Card>

              {/* Total Departments Card */}
              <Card
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 border-b-4 border-red-500"
              >
                <Statistic
                  title="Total Departments"
                  value={totalDepartments}
                  prefix={<BankOutlined className="text-red-500 text-2xl" />}
                  valueStyle={{ color: '#EF4444', fontSize: '2.5rem' }}
                />
                <p className="text-gray-500 text-sm mt-2">Academic divisions</p>
              </Card>

              {/* Total Courses Card */}
              <Card
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 border-b-4 border-blue-500"
              >
                <Statistic
                  title="Total Courses"
                  value={totalCourses}
                  prefix={<BookOutlined className="text-blue-500 text-2xl" />}
                  valueStyle={{ color: '#3B82F6', fontSize: '2.5rem' }}
                />
                <p className="text-gray-500 text-sm mt-2">Available programs</p>
              </Card>
            </div>

            {/* Quick Actions Section */}
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Manage Students Card */}
              <Card
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Manage Students
                  </h3>
                  <UserOutlined className="text-blue-500 text-4xl" />
                </div>
                <p className="text-gray-600 mb-6">
                  Access detailed student accounts, filter by department, and
                  review individual profiles.
                </p>
                <Button
                  type="primary"
                  size="large"
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                  icon={<ArrowRightOutlined />}
                  // onClick={() => window.location.href = '/students'} // Example navigation
                >
                  Go to Students
                </Button>
              </Card>

              {/* Manage Teachers Card */}
              <Card
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Manage Teachers
                  </h3>
                  <TeamOutlined className="text-green-500 text-4xl" />
                </div>
                <p className="text-gray-600 mb-6">
                  View faculty directory, check assigned courses, and monitor
                  teacher workload.
                </p>
                <Button
                  type="primary"
                  size="large"
                  className="w-full rounded-lg bg-green-600 hover:bg-green-700 transition-colors duration-300"
                  icon={<ArrowRightOutlined />}
                  onClick={()=>router.push("/allaccounts/teachers")} // Example navigation
                >
                  Go to Teachers
                </Button>
              </Card>
            </div>

            {/* Placeholder for future sections */}
            <div className="mt-12 text-center text-gray-500 italic">
              <p>More insights and features coming soon!</p>
              <p className="text-sm">
                (e.g., Departmental Performance, Course Enrollments, System Logs)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}