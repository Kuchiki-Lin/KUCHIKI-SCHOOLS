
"use client"

import { useUser } from "@/app/private"
import { Button, Form, message, Select } from "antd"
import { logout } from "@/app/signout"
import { LogoutOutlined, MenuOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import CatScheduler from "@/app/components/cats"
import ClassesPage from "@/app/components/teachclass"
import TeacherCalender from "@/app/components/tscheduler"

// Define types for better readability and type safety
type CourseType = {
  id: number;
  name: string;
  code: string;
  student_count?: number;
}

type RegisteredStudent = {
  student: string;
  course: string;
  code: string;
  status: string;
};

const TeacherDashboard = () => {
  const { user } = useUser() // Get user information from a custom hook
  const [courseList, setCourseList] = useState<CourseType[]>([]); // State to store available courses
  const [sidebarOpen, setSidebarOpen] = useState(false) // State to control sidebar visibility
  const [activeSection, setActiveSection] = useState("dashboard") // State to manage active content section
  const [assignedCourses, setAssignedCourses] = useState<CourseType[]>([]) // State to store courses assigned to the teacher
  const [students, setStudents] = useState<RegisteredStudent[]>([]); // State to store registered students

  // Effect to fetch registered students for the teacher
  useEffect(() => {
    if (!user?.id) return; // Only fetch if user ID is available
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/students`)
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : [])) // Ensure data is an array
      .catch(error => console.error("Failed to fetch students:", error)); // Basic error handling
  }, [user?.id]); // Re-run when user ID changes

  // Effect to fetch courses based on the teacher's department
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.department) return; // Only fetch if department is available
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/department/${user.department}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setCourseList(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        message.error("Failed to load available courses.");
      }
    }
    fetchCourses();
  }, [user?.department]); // Re-run when user department changes

  // Effect to fetch courses already assigned to the teacher
  useEffect(() => {
    const fetchAssignedCourses = async () => {
      if (!user?.id) return // Only fetch if user ID is available
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/courses-with-count`, {
          credentials: "include", // Include cookies for authentication
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json()
        setAssignedCourses(data)
      } catch (error) {
        console.error("Failed to fetch assigned courses:", error);
        message.error("Failed to load assigned courses.");
      }
    }
    fetchAssignedCourses()
  }, [user?.id]) // Re-run when user ID changes

  // Handler for assigning courses to the teacher
  const handleAssignCourses = async (values: { course_ids: number[] }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user?.id}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        message.success(data.message || "Courses assigned successfully");
      } else {
        message.error(data.error || "Something went wrong during assignment");
      }

      // Refresh the list of assigned courses after successful assignment
      const assignedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/${user?.id}/courses-with-count`, { // Changed endpoint to match initial fetch
        credentials: 'include',
      });
      if (!assignedRes.ok) {
        throw new Error(`HTTP error! status: ${assignedRes.status}`);
      }
      const updatedCourses = await assignedRes.json();
      setAssignedCourses(updatedCourses);
    } catch (error) {
      console.error("Failed to assign courses:", error);
      message.error("Failed to assign courses. Please try again.");
    }
  };

  // Group students by their names for display
  const groupedStudents = Array.isArray(students)
    ? students.reduce((acc: Record<string, RegisteredStudent[]>, curr) => {
      if (!acc[curr.student]) acc[curr.student] = [];
      acc[curr.student].push(curr);
      return acc;
    }, {})
    : {};

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button className="w-1 h-1 relative right-[97px]" icon={<MenuOutlined />} onClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar Navigation */}
        {sidebarOpen && (
          <aside className="w-60 border-2 border-white min-h-[50%]
            text-white p-4 transition-all duration-300 rounded-lg shadow-lg flex flex-col justify-between relative right-[100px]">
            <div className="flex flex-col items-center">
              {/* Avatar Placeholder */}
              <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white shadow-md mb-6 mt-2"></div>
              <ul id="sidebar-menu" className="w-full flex flex-col gap-4 items-center">
                <li
                  id="MainDashboard"
                  onClick={() => setActiveSection("dashboard")}
                  className="bg-white shadow-md text-black w-44 py-3 px-4 text-center rounded-lg hover:scale-105 transition cursor-pointer"
                >
                  Dashboard
                </li>
                <li
                  id="My Courses"
                  onClick={() => setActiveSection("courses")}
                  className="bg-white shadow-md text-black w-44 py-3 px-4 text-center rounded-lg hover:scale-105 transition cursor-pointer"
                >
                  My Courses
                </li>
                <li
                  id="My Students"
                  onClick={() => setActiveSection("students")}
                  className="bg-white shadow-md text-black w-44 py-3 px-4 text-center rounded-lg hover:scale-105 transition cursor-pointer">
                  My Students
                </li>
                <li
                  onClick={() => setActiveSection("classes")}
                  className="bg-white shadow-md text-black w-44 py-3 px-4 text-center rounded-lg hover:scale-105 transition cursor-pointer">
                  Classes
                </li>
                <li
                  onClick={() => setActiveSection("calender")}
                  className="bg-white shadow-md text-black w-44 py-3 px-4 text-center rounded-lg hover:scale-105 transition cursor-pointer">
                  Calendar
                </li>
                <li
                  onClick={() => setActiveSection("cyats")}
                  className="bg-white shadow-md text-black w-44 py-3 px-4 text-center rounded-lg hover:scale-105 transition cursor-pointer">
                  CATS
                </li>
              </ul>
            </div>

            {/* Logout Button */}
            <div className="mt-10 flex justify-center">
              <Button onClick={logout} icon={<LogoutOutlined />} className="bg-red-500 text-white border-none hover:bg-red-600">
                Logout
              </Button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-2' : 'ml-0'}`}>
          <div>
            <div className="p-10">
              {/* User Info Display */}
              <p className="absolute right-40 top-11 font-bold p-2 rounded-lg shadow-lg text-white border-2"> {user?.fullname} </p>
              <p className="absolute right-40 font-bold mt-2.5 p-2 rounded-lg shadow-lg text-white border-2">{user?.department} Department</p>
            </div>

            {/* Dashboard Section (now blank) */}
            {activeSection === "dashboard" && (
              <div className="p-4 text-white flex justify-center items-center h-full">
                {/* This section is intentionally left blank as per your request. */}
                <p>Welcome to your Dashboard!</p>
              </div>
            )}

            {/* My Courses Section (now includes assignment form and assigned courses list) */}
            {activeSection === "courses" && (
              <div className="mt-6 px-4">
                <h3 className="text-white flex justify-center border-2 font-bold mb-4 text-xl p-2 rounded-md">Assign Courses</h3>
                {/* Course Assignment Form */}
                <div className="bg-white/10 p-6 rounded-lg shadow-xl mb-8"> {/* Added new container for styling */}
                  <Form onFinish={handleAssignCourses}
                    layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}> {/* Removed mt-20, using container for spacing */}
                    <Form.Item name="course_ids" label="Select Courses">
                      <Select mode="multiple" placeholder="Choose courses">
                        {Array.isArray(courseList) && courseList.map(course => (
                          <Select.Option key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button htmlType="submit" type="primary" className="w-full">Assign</Button>
                  </Form>
                </div>

                <h3 className="text-white flex justify-center border-2 font-bold mt-12 mb-4 text-xl p-2 rounded-md">Your Assigned Courses</h3> {/* Changed mt-24 to mt-12 */}
                {/* Display of Assigned Courses */}

                {Array.isArray(assignedCourses) && assignedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assignedCourses.map(course => (
                      <div
                        key={course.id}
                        className="p-4 rounded-xl border-2 border-white text-white bg-white/5 shadow-md hover:scale-105 transition-transform duration-200" // Added bg, shadow, hover effects
                      >
                        <h3 className="text-lg font-bold ">
                          {course.name} <span className="text-sm font-extrabold text-[#e0ee28]">({course.code})</span>
                        </h3>
                        <p className="text-sm text-[#0cf20c] mt-1">
                          {course.student_count ?? 0} STUDENT(S) ENROLLED
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic mt-4 text-center">No courses assigned yet.</p>
                )}
              </div>
            )}

            {/* My Students Section */}
            {activeSection === "students" && (
              <div className="mt-6 ">
                <h3 className="text-lg text-white flex justify-center font-bold border-2 border-white">Registered Students</h3>
                <h4 className="ml-[50%] mr-[50%] text-lg text-white flex justify-center w-32 font-bold border-2 border-white">
                  {Object.keys(groupedStudents).length} Student{Object.keys(groupedStudents).length !== 1 && 's'}
                </h4>

                <ul className="space-y-4">
                  {Object.entries(groupedStudents).map(([studentName, courses], idx) => (
                    <li key={idx} className="p-4 bg-white rounded-lg shadow border-l-4 border-green-600">
                      <div className="text-md font-bold text-gray-800 mb-2">{studentName}</div>
                      <ul className="ml-4 list-disc text-sm text-gray-600 space-y-1">
                        {courses.map((course, i) => (
                          <li key={i}>
                            {course.course} ({course.code}) — <span className="text-green-700">{course.status}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CATS Section */}
            {activeSection === "cyats" && (
              <CatScheduler />
            )}

            {/* Calendar Section */}
            {activeSection === "calender" && user?.id && (
              <TeacherCalender />
            )}

            {/* Classes Section */}
            {activeSection === "classes" && user?.id && (
              <ClassesPage />
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default TeacherDashboard;
