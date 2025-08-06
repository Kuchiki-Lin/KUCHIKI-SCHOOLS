
"use client"

import { useUser } from "@/app/private"
import { Button, Form, Select } from "antd"
import { LogoutOutlined, MenuOutlined, DashboardOutlined, BookOutlined, FileTextOutlined, CalendarOutlined, BellOutlined, ReadOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import LogoutButton from "@/app/logout"
import clsx from "clsx"
import ClassesThisWeek from "@/app/components/classesthisweek"
import UpcomingClassSummary from "@/app/components/upcomingclasses"
import Logo  from "@/app/components/logo"

type CourseType = {
    id: number;
    name: string;
    code: string;
}

interface Cat {
    id: number;
    course_id: number;
    course_name: string;
    teacher_id: number;
    cat_datetime: string; // Time from backend is serialized as string (ISO format)
}


const StudentDashboard = () => {
    const { user } = useUser()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("dashboard")
    const [availableCourses, setAvailableCourses] = useState<CourseType[]>([])
    const [myCourses, setMyCourses] = useState<CourseType[]>([])

    const [myCats, setMyCats] = useState<Cat[]>([]);

    useEffect(() => {
        if (!user?.id) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats/student/${user.id} `)
            .then(res => res.json())
            .then(data => setMyCats(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error("Failed to fetch student CATs:", err);
                setMyCats([]);
            });
    }, [user?.id]);



    useEffect(() => {
        if (!user?.id) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${user.id}/department-courses`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAvailableCourses(data);
                } else {
                    console.error("Expected array but got:", data);
                    setAvailableCourses([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch department courses", err);
                setAvailableCourses([]);
            });
    }, [user?.id]);


    useEffect(() => {
        if (!user?.id) return
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${user.id}/courses`)
            .then(res => res.json())
            .then(data => setMyCourses(Array.isArray(data) ? data : []))
    }, [user?.id])

    const handleSubmit = async (values: any) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${user?.id}/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        })

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${user?.id}/courses`)
        const data = await res.json()
        setMyCourses(data)
    }

    return (
        <div className="flex min-h-screen" >
            {/* Sidebar Toggle Button for small screens */}
            <Button
                className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white rounded-full p-2 shadow-lg"
                icon={<MenuOutlined />}
                onClick={() => setSidebarOpen((prev) => !prev)}
            />

            {/* Sidebar */}
  <aside
  className={clsx(
    "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-green-700 to-green-800 text-white transition-transform duration-300 ease-in-out",
    {
      "translate-x-0": sidebarOpen,        // Visible when open
      "-translate-x-full": !sidebarOpen,   // Hidden when closed
            // Always visible on large screens
    }
  )}
>



  {/* Profile Section */}
  <div className="flex flex-col items-center py-6 border-b border-green-600 mb-6">
    <div className="w-20 h-20 rounded-full bg-green-300 flex items-center justify-center text-3xl font-bold text-green-800 mb-2 border-4 border-white shadow-md">
      {user?.fullname?.[0]?.toUpperCase() || "U"}
    </div>
    <p className="text-lg font-semibold text-white text-center px-2">{user?.fullname}</p>
  </div>

  {/* Navigation Menu */}
  <ul className="space-y-3 px-2">
    {[
      { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
      { key: "courses", label: "My Courses", icon: <BookOutlined /> },
      { key: "CATS", label: "CATs", icon: <BellOutlined /> },
      { key: "classes", label: "Classes", icon: <CalendarOutlined /> },
    ].map(({ key, label, icon }) => (
      <li
        key={key}
        onClick={() => {
          setActiveSection(key);
          setSidebarOpen(false);
        }}
        className={clsx(
          "flex items-center px-4 py-3 rounded-lg cursor-pointer transition duration-200 font-medium",
          activeSection === key
            ? "bg-green-600 text-white shadow"
            : "text-green-100 hover:bg-green-600 hover:text-white"
        )}
      >
        <span className="mr-3 text-xl">{icon}</span>
        {label}
      </li>
    ))}

    {/* Coming Soon */}
    <li className="flex items-center px-4 py-3 rounded-lg text-green-200 cursor-not-allowed opacity-50">
      <FileTextOutlined className="mr-3 text-xl" />
      Assignments (Coming Soon)
    </li>
  </ul>

  {/* Logout Button */}
  <div className="absolute bottom-6 left-0 w-full px-5">
   <LogoutButton/>
  </div>
</aside>

            {/* Main Content */}
            <main className={clsx("flex-1 p-8 transition-all duration-300", sidebarOpen ? 'lg:ml-64' : 'lg:ml-0')}>
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
                    <Logo/>
                    <h1 className="text-xl font-extralight text-white " style={{fontFamily:"cursive"}}>
                        
                        {activeSection === "dashboard" && "My Dashboard"}
                        {activeSection === "courses" && "My Courses"}
                        {activeSection === "CATS" && "Continuous Assessment Tests"}
                        {activeSection === "classes" && "My Weekly Schedule"}
                    </h1>
                    <div className="flex items-center space-x-3">
                        <span className="text-lg font-medium text-white"> {user?.fullname?.split(' ')[0] || "Student"}</span>
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-semibold">
                            {user?.fullname ? user.fullname[0].toUpperCase() : 'U'}
                        </div>
                    </div>
                </header>

                {/* Dashboard View */}
                {activeSection === "dashboard" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Upcoming CAT Alerts */}
                        {myCats.some(cat => {
                            const diffDays = (new Date(cat.cat_datetime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                            return diffDays <= 21 && diffDays >= 0;
                        }) && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 p-5 rounded-lg shadow-md flex items-start space-x-3">
                                    <BellOutlined className="text-3xl text-yellow-600 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Upcoming CAT Alert!</h3>
                                     <p className="text-sm">
  Upcoming CAT(s):{" "}
  <strong>
    {myCats
      .filter(cat => {
        const diff = new Date(cat.cat_datetime).getTime() - Date.now();
        return diff <= 1000 * 60 * 60 * 24 * 21 && diff >= 0;
      })
      .map(cat => cat.course_name)
      .join(", ")}
  </strong>
</p>

                                    </div>
                                </div>
                            )}

                        {/* Recently Set CAT */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                                <FileTextOutlined className="mr-3 text-2xl" /> Recently Set CAT
                            </h3>
                            {myCats
                                .filter(cat => new Date(cat.cat_datetime) > new Date())
                                .sort((a, b) => new Date(b.cat_datetime).getTime() - new Date(a.cat_datetime).getTime())
                                .slice(0, 1)
                                .map(cat => (
                                    <div key={cat.id} className="bg-blue-100 p-3 rounded-md border border-blue-200">
                                        <p className="text-md font-semibold text-blue-700">{cat.course_name}</p>
                                        <p className="text-sm text-blue-600 mt-1">Due: {new Date(cat.cat_datetime).toLocaleDateString()} at {new Date(cat.cat_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                )) || (
                                    <p className="text-gray-500 text-sm italic">No recent CATs set.</p>
                                )}
                        </div>

                        {/* Upcoming Classes (Stub for now) */}
                         <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center">
                                <CalendarOutlined className="mr-3 text-2xl" /> Upcoming Classes
                            </h3>
                            {user && <UpcomingClassSummary studentId={user.id} />} {/* Changed here */}
                        </div>


                        {/* Course Summary */}
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                                <ReadOutlined className="mr-3 text-2xl" /> My Courses
                            </h3>
                            <p className="text-md text-gray-700">
                                You’re currently enrolled in <span className="font-bold text-purple-700">{myCourses.length}</span> course{myCourses.length !== 1 && "s"}.
                            </p>
                            <Button
                                type="link"
                                className="mt-3 p-0 text-purple-600 hover:text-purple-800 font-semibold"
                                onClick={() => setActiveSection("courses")}
                            >
                                View all courses &rarr;
                            </Button>
                        </div>

                    </div>
                )}


                {/* Courses View */}
                {activeSection === "courses" && (
                    <div className=" p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-white">My Enrolled Courses</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.isArray(myCourses) && myCourses.length > 0 ? (
                                myCourses.map(course => (
                                    <div key={course.id} className="p-5 border-r-4 border-b-4 border-yellow-200 bg-gradient-to-br from -amber-300 to-amber-400  shadow-md hover:shadow-lg transition-shadow duration-200">
                                        <h3 className="text-xl font-extrabold text-[#050714] mb-1">{course.name}</h3>
                                        <p className="text-sm text-[#050714] font-medium" style={{fontStyle:"italic", fontFamily:"cursive"}}      >{course.code}</p>
                                        <p className="text-sm text-white mt-2">Enrolled: 2024/2025 Academic Year</p> {/* Example static data */}
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-lg flex items-center space-x-3">
                                    <span className="text-2xl">💡</span>
                                    <p className="text-lg">You haven’t enrolled in any courses yet. Explore available courses!</p>
                                </div>
                            )}
                        </div>

                        {/* Course Enrollment Form */}
                        <div className="mt-10 pt-8 border-t border-gray-200">
                            <h2 className=" font-semibold text-white mb-5 ">Enroll in a Course</h2>
                            <Form
                                layout="vertical"
                                onFinish={handleSubmit}
                                className="max-w-xl  p-6 rounded-lg shadow-inner"
                            >
                                <Form.Item
                                    name="course_ids"
                                    label={<span className="font-extralight text-white">Select Courses to Enroll</span>}
                                    rules={[{ required: true, message: 'Please select at least one course!' }]}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Select courses"
                                        className="w-full"
                                        size="large"
                                    >
                                        {availableCourses.map(course => (
                                            <Select.Option key={course.id} value={course.id}>
                                                {course.name} ({course.code})
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="w-full bg-yellow-400 hover:!bg-blue-700 text-white font-bold py-2.5 rounded-lg text-lg"
                                    >
                                        Enroll Selected Courses
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </div>
                )}


                {activeSection === "CATS" && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-green-800 mb-6">Your Upcoming CATs</h2>

                        {/* Notification for newly added CATs */}
                        {myCats.filter(cat => new Date(cat.cat_datetime) > new Date()).length > 0 && (
                            <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded-lg shadow-sm flex items-center space-x-3">
                                <BellOutlined className="text-2xl text-yellow-600" />
                                <p className="text-md font-medium">You have new upcoming CAT(s). Don’t forget to prepare!</p>
                            </div>
                        )}

                        {myCats.filter(cat => new Date(cat.cat_datetime) > new Date()).length === 0 ? (
                            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-gray-400 text-gray-700 flex items-center space-x-3">
                                <span className="text-2xl">✨</span>
                                <p className="text-lg">No CATs scheduled yet for your courses. Check back later!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myCats
                                    .filter(cat => new Date(cat.cat_datetime) > new Date())
                                    .sort((a, b) => new Date(a.cat_datetime).getTime() - new Date(b.cat_datetime).getTime()) // Sort by earliest first
                                    .map((cat) => {
                                        const now = new Date();
                                        const catDate = new Date(cat.cat_datetime);
                                        const diffDays = Math.ceil((catDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                                        let colorClass = "border-blue-500 bg-blue-50 text-blue-800"; // Default
                                        let statusText = "Upcoming";

                                        if (diffDays <= 7 && diffDays >= 0) {
                                            colorClass = "border-red-500 bg-red-50 text-red-800";
                                            statusText = "Urgent: Less than 7 days!";
                                        } else if (diffDays <= 21 && diffDays > 7) {
                                            colorClass = "border-yellow-500 bg-yellow-50 text-yellow-800";
                                            statusText = "Approaching: Less than 3 weeks!";
                                        }

                                        return (
                                            <div
                                                key={cat.id}
                                                className={`p-5 rounded-xl border-l-4 shadow-md hover:shadow-lg transition-shadow duration-200 ${colorClass}`}
                                            >
                                                <h3 className="text-xl font-bold mb-2 flex items-center">
                                                    <FileTextOutlined className="mr-2" /> {cat.course_name}
                                                </h3>
                                                <p className="text-sm flex items-center mb-1">
                                                    <CalendarOutlined className="mr-2" />
                                                    <span className="font-semibold">Date:</span> {catDate.toLocaleDateString()}
                                                </p>
                                                <p className="text-sm flex items-center mb-2">
                                                    <BellOutlined className="mr-2" />
                                                    <span className="font-semibold">Time:</span> {catDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className={`text-xs font-semibold ${diffDays <= 7 ? 'text-red-700' : diffDays <= 21 ? 'text-yellow-700' : 'text-blue-700'}`}>
                                                    Status: {statusText}
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}

                {user &&
                    activeSection === "classes" && (
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <CalendarOutlined className="mr-3 text-2xl" /> My Weekly Class Schedule
                            </h2>
                            <ClassesThisWeek studentId={user.id} />
                        </div>
                    )}

            </main>
        </div>
    )
}

export default StudentDashboard