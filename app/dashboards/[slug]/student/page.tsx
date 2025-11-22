
"use client"

import { useUser } from "@/app/private"
import { Button, Form, Select } from "antd"
import {  MenuOutlined, DashboardOutlined, BookOutlined, FileTextOutlined, CalendarOutlined, BellOutlined, ReadOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import LogoutButton from "@/app/logout"
import clsx from "clsx"
import { useParams } from "next/navigation"
import ClassesThisWeek from "@/app/components/classesthisweek"
import UpcomingClassSummary from "@/app/components/upcomingclasses"

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
    const {slug}= useParams();
    const [myCats, setMyCats] = useState<Cat[]>([]);
    console.log(user);

    useEffect(() => {
        if (!user) return;
        if (!user?.id) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats/student/${user.id} `)
            .then(res => res.json())
            .then(data => setMyCats(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error("Failed to fetch student CATs:", err);
                setMyCats([]);            });
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
        <div 
  className="flex min-h-screen"
  style={{
    backgroundImage: user?.background_url ? `url(${user.background_url})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>

            {/* Sidebar Toggle Button for small screens */}
            <button
                className=" fixed top-3 left-2 z-50  text-white p-2 shadow-lg"
              
                onClick={() => setSidebarOpen((prev) => !prev)}
            >
                <MenuOutlined className="p-2 border-2 bg-white "/>
                </button>

            {/* Sidebar */}
  <aside
  className={clsx(
    "fixed inset-y-0 left-0 z-40 w-64  text-white transition-transform duration-300 ease-in-out bg-white",
    {
      "translate-x-0": sidebarOpen,        // Visible when open
      "-translate-x-full": !sidebarOpen,   // Hidden when closed
            // Always visible on large screens
    }
  )}
>


  {/* Profile Section */}
  <div className="flex flex-col items-center pt-2.5">
    <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-2 border-4 shadow-md text-black/50">
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
        style={{fontFamily:"cursive"}}
        className={clsx(
          "flex items-center px-4 py-3 rounded-lg cursor-pointer transition duration-200 font-medium",
          activeSection === key
            ? "bg-black/15 text-black shadow"
            : "text-black hover:bg-black/15 hover:text-white"
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
                      <div className=" flex bg-white border-4 p-2.5 rounded-2xl ml-5  text-black justify-center h-auto" style={{fontFamily:"cursive"}}>
 {user?.logo_text}
        </div> 
                    <h1 className="text-2xl font-bold px-2 bg-white border-2 rounded " style={{fontFamily:"monospace"}}>
                        
                        {activeSection === "dashboard" && " Dashboard"}
                        {activeSection === "courses" && "Courses"}
                        {activeSection === "CATS" && "CATS"}
                        {activeSection === "classes" && " Weekly Schedule"}
                    </h1>
                    <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold bg-white border-2 px-4 " style={{fontFamily:"cursive"}}> {user?.fullname || "STUDENT"}</span>
                        <div className="w-12 h-12 border-2  flex items-center justify-center bg-white font-semibold">
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
                                <div className=" border-4  p-5 rounded-lg shadow-md
                                bg-white
                                ">
                                <div>
                                            <h3 className="
                                            text-red-700
                                            text-md font-bold mb-3 flex justify-center"
                            style={{fontFamily:"cursive", fontWeight:"bold"}}>
                                            <BellOutlined className="text-2xl  mr-3 " 
                                             style={{fontFamily:"cursive", fontWeight:"bold"}}
                                            />
                                            Upcoming CAT(s) !</h3>
                            <div className="flex justify-center ">
  <ul className=" w-1/2 p-3  rounded " style={{ marginTop: "10px", fontFamily: "cursive" }}>
    {myCats
      .filter(cat => {
        const diff = new Date(cat.cat_datetime).getTime() - Date.now();
        return diff <= 1000 * 60 * 60 * 24 * 21 && diff >= 0;
      })
      .map(cat => (
        <li key={cat.id} className="py-1 mt-1.5 bg-white border-2 rounded p-3 text-md"
        style={{marginBottom:"4px"}}>
          {cat.course_name}
        </li>
      ))}
  </ul>
</div>
</div>
</div>
 )}

                        {/* Recently Set CAT */}
                        <div className=" border-4  p-5 rounded-lg shadow-md
                        bg-white
                        ">
                              <h3 className="text-md font-bold mb-3 flex justify-center
        text-green-700"
                            style={{fontFamily:"cursive", fontWeight:"bold"}}>
                                <FileTextOutlined className="mr-3 " /> Recently Set CAT
                            </h3>
                            {myCats
                                .filter(cat => new Date(cat.cat_datetime) > new Date())
                                .sort((a, b) => new Date(b.cat_datetime).getTime() - new Date(a.cat_datetime).getTime())
                                .slice(0, 1)
                                .map(cat => (
                                    <div key={cat.id} className=" p-3 rounded-md border-2 text-md mt-10
                                     "
                                      style={{fontFamily:"cursive", fontWeight:"bold"}}
                                    >
                                        <p className="  flex justify-center">{cat.course_name}</p>
                                        <p className="  flex justify-center mt-1">Due: <span className="mr-2 ml-2">  {new Date(cat.cat_datetime).toLocaleDateString()} </span> AT <span className="ml-2">{  new Date(cat.cat_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} </span></p>
                                    </div>
                                )) || (
                                    <p className=" text-sm italic">No recent CATs set.</p>
                                )}
                        </div>
                        {/* Upcoming Classes  */}
                         <div className=" border-4  p-5 rounded-lg shadow-md bg-white
                         ">
                             <h3 className="text-md font-bold text-green-700
                             mb-3 flex justify-center"
                            style={{fontFamily:"cursive", fontWeight:"bold"}}>
                                <CalendarOutlined className="mr-3 " /> Upcoming Classes
                            </h3>
                            {user && <UpcomingClassSummary studentId={user.id} />} 
                        </div>


                        {/* Course Summary */}
                        <div className=" border-4    p-5 rounded-lg shadow-md  bg-white
                        ">
                            <h3 className="text-md font-bold mb-3 flex justify-center
                            text-green-700

                            "
                            style={{fontFamily:"cursive", fontWeight:"bold"}}>
                                <ReadOutlined className="mr-3 " /> My Courses
                            </h3>
                            <p className="font-bold pl-2.5"
                            style={{fontFamily:"cursive"}}>
                                You’re currently enrolled in <span className="font-bold text-amber-700">{myCourses.length}</span> course{myCourses.length !== 1 && "s"}.
                            </p>
                            <div className="  hover:bg-black/15 font-bold text-sm
                            "> 
                                  <button
                                 
                                type="button"
                        style={{ width:"160px"}}
                                onClick={() => setActiveSection("courses")}
                            >
                                View all courses &rarr;
                            </button>
                            </div>
                
                            
                        </div>

                    </div>
                )}


                {/* Courses View */}
                {activeSection === "courses" && (
                    <div className=" p-6 rounded-lg shadow-lg  ">
                        <h2 className="w-fit border-2 p-2 rounded font-bold mb-6  bg-white text-md " style={{fontFamily:"cursive"}}>My Enrolled Courses</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-2 bg-white rounded p-6">
  {Array.isArray(myCourses) && myCourses.length > 0 ? (
    myCourses.map((course) => (
      <div
        key={course.id}
        className="p-6 border-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white"
      >
        <h3 className="text-xl font-extrabold text-[#050714] mb-2">
          {course.name}
        </h3>
        <p
          className="text-md text-[#0a1454] font-medium mb-3"
          style={{ fontStyle: "italic", fontFamily: "cursive" }}
        >
          {course.code}
        </p>
        <p className="text-sm bg-white font-bold pt-2 border-t">
          ENROLLED: 2024/2025 ACADEMIC YEAR
        </p>
      </div>
    ))
  ) : (
    <div className="col-span-full p-8 rounded-lg flex items-center justify-center">
      <p className="text-md text-center" style={{ fontFamily: "cursive" }}>
        💡 You haven’t enrolled in any courses yet. Explore available courses!
      </p>
    </div>
  )}
</div>



                        {/* Course Enrollment Form */}
                  <div className="mt-10 pt-8 border-2 bg-white rounded w-full flex flex-col items-center">
  {/* Title */}
  <h2
    className="font-extrabold text-center p-2 mb-5"
    style={{ fontFamily: "cursive", fontWeight: "bolder" }}
  >
    ENROLL IN A COURSE
  </h2>

  {/* Form */}
  <Form
    layout="vertical"
    onFinish={handleSubmit}
    className="w-full max-w-xl p-6 rounded-lg shadow-inner flex flex-col items-center"
  >
    {/* Course Select */}
    <Form.Item
      name="course_ids"
      label={
        <span style={{ fontFamily: "cursive", fontWeight: "bolder" }}>
          Select Courses to Enroll
        </span>
      }
      rules={[{ required: true, message: "Please select at least one course!" }]}
      className="w-full"
    >
      <Select
        mode="multiple"
        placeholder="Select courses"
        className="w-full border-2"
        size="large"
      >
        {availableCourses.map((course) => (
          <Select.Option key={course.id} value={course.id}>
            {course.name} ({course.code})
          </Select.Option>
        ))}
      </Select>
    </Form.Item>

    {/* Enroll Button */}
    <Form.Item className="w-full flex justify-center pt-8">
      <button
        style={{ fontFamily: "cursive" }}
        className="
          hover:!bg-black/15 bg-white w-[200px] font-bold 
          py-2.5 rounded-lg text-lg border-2
        "
      >
        Enroll
      </button>
    </Form.Item>
  </Form>
</div>

                    </div>
                )}


                {activeSection === "CATS" && (
                    <div className="w-3/4  p-6 rounded-lg shadow-lg">
                        <h2 className=" font-bold  mb-6 text-xl p-2 bg-white rounded
                        "
                        style={{fontFamily:"cursive",}}  > Upcoming CATs</h2>

                        {/* Notification for newly added CATs */}
                        {myCats.filter(cat => new Date(cat.cat_datetime) > new Date()).length > 0 && (
                            <div className="mb-6 p-4 border-4  rounded-lg shadow-sm flex items-center space-x-3
                bg-white    ">
                                <BellOutlined className="text-2xl text-red-600 bg-white" />
                   <p
                   style={{marginTop:"2px", marginBottom:"0", backgroundColor:"white", fontFamily:"cursive"}} 
                   className=" text-md font-bold">You have new upcoming CAT(s). Don’t forget to prepare!</p>
                            </div>
                        )}

                        {myCats.filter(cat => new Date(cat.cat_datetime) > new Date()).length === 0 ? (
                            <div className="  p-5 rounded-lg border-4  flex items-center space-x-3 bg-white">
                                <span className="text-2xl">✨</span>
                                <p className="text-lg">No CATs scheduled yet for your courses. Check back later!</p>
                            </div>
                        ) : (
                            <div className="
                            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            colorClass = "border-yellow-500  text-black ";
                                            statusText = "Approaching: Less than 3 weeks!";
                                        }

                                        return (
                                            <div
                                                key={cat.id}
                                                className={`p-5 rounded-xl  text-black font-bold  border-4 shadow-md hover:shadow-lg transition-shadow duration-200  bg-white   `}
                                                
                                            >
                                                <h3 className="  mb-2 flex items-center text-red-700
                                                "
                                                style={{fontFamily:"cursive", fontWeight:"800px",

                                                }}>
                                                    <FileTextOutlined className="mr-2" /> {cat.course_name.toLocaleUpperCase()}
                                                </h3>
                                                <p className="text-sm flex items-center mb-1">
                                                    <CalendarOutlined className="mr-2" />
                                                    <span className="font-semibold">Date:</span> {catDate.toLocaleDateString()}
                                                </p>
                                                <p className="text-sm flex items-center mb-2">
                                                    <BellOutlined className="mr-2" />
                                                    <span className="font-semibold">Time:</span> {catDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className={`text-xs  bg-white ${diffDays <= 7 ? 'text-red-700' : diffDays <= 21 ? 'text-black' : 'text-black'}`}
                                                style={{fontFamily:"cursive", fontWeight:"800"}}>
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
                        <div className="   p-6 rounded-lg shadow-lg">
                              <h3 className="text-xl font-bold bg-white mb-3 flex justify-center w-fit
                              "
                            style={{fontFamily:"cursive", fontWeight:"bold"}}>
                                <CalendarOutlined className="mr-3 text-2xl" /> My Weekly Class Schedule
                            </h3>
                            <ClassesThisWeek studentId={user.id} />
                        </div>
                    )}

            </main>
        </div>
    )
}

export default StudentDashboard