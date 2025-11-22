"use client"

import { useUser } from "@/app/private"
import { Form, message, Select, Tabs } from "antd"
import LogoutButton from "@/app/logout"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import CatScheduler from "@/app/components/cats"
import ClassesPage from "@/app/components/teachclass"
import TeacherCalender from "@/app/components/tscheduler"
import TeacherSchedule from "@/app/components/tsdashsched"

type CourseType = {
  id: number
  name: string
  code: string
  student_count?: number
}

type RegisteredStudent = {
  student: string
  course: string
  code: string
  status: string
}

const TeacherDashboard = () => {
  const { user } = useUser()
  const [courseList, setCourseList] = useState<CourseType[]>([])
  const [assignedCourses, setAssignedCourses] = useState<CourseType[]>([])
  const [students, setStudents] = useState<RegisteredStudent[]>([])
  const {slug} = useParams();
  
  console.log(slug);


  // fetch students
  useEffect(() => {
    if (!user)return;
     console.log(user)
    if (!user ||!user?.id) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/${slug}/teacher/${user.id}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Failed to fetch students:", error))
  }, [user])

  // fetch courses by department
  useEffect(() => {
    if (!user?.department) return
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/department/${user.department}`
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        setCourseList(data)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        message.error("Failed to load available courses.")
      }
    }
    fetchCourses()
  }, [user?.department])

  // fetch assigned courses
  useEffect(() => {
    if (!user?.id) return
    const fetchAssignedCourses = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/courses-with-count`,
          { credentials: "include" }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        setAssignedCourses(data)
      } catch (error) {
        console.error("Failed to fetch assigned courses:", error)
        message.error("Failed to load assigned courses.")
      }
    }
    fetchAssignedCourses()
  }, [user?.id])

  const handleAssignCourses = async (values: { course_ids: number[] }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teacher/${user?.id}/courses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        }
      )

      const data = await res.json()
      if (res.ok) {
        message.success(data.message || "Courses assigned successfully")
      } else {
        message.error(data.error || "Something went wrong during assignment")
      }

      // refresh assigned courses
      const assignedRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teacher/${user?.id}/courses-with-count`,
        { credentials: "include" }
      )
      if (!assignedRes.ok) throw new Error(`HTTP error!`)
      const updatedCourses = await assignedRes.json()
      setAssignedCourses(updatedCourses)
    } catch (error) {
      console.error("Failed to assign courses:", error)
      message.error("Failed to assign courses. Please try again.")
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
  if (!user?.id) return;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teacher/${user.id}/course/${courseId}`,
      { method: "DELETE", credentials: "include" }
    );

    const data = await res.json();
    if (res.ok) {
      message.success(data.message || "Course removed");
      // update state to reflect deletion
      setAssignedCourses((prev) => prev.filter((c) => c.id !== courseId));
    } else {
      message.error(data.error || "Failed to remove course");
    }
  } catch (err) {
    console.error("Delete course failed:", err);
    message.error("Server error while deleting course");
  }
};


  const groupedStudents = Array.isArray(students)
    ? students.reduce((acc: Record<string, RegisteredStudent[]>, curr) => {
        if (!acc[curr.student]) acc[curr.student] = []
        acc[curr.student].push(curr)
        return acc
      }, {})
    : {}

  const tabItems = [
  {
    key: "1",
    label: "Dashboard",
    children: (
      <div className="border-2 rounded-xl p-4">
        <TeacherSchedule />
      </div>
    ),
  },
  {
    key: "2",
    label: "My Courses",
    children: (
      <div className="border-2 rounded-xl p-4 space-y-8">
        {/* Assign Courses */}
        <div className="rounded-xl shadow-md p-6 backdrop-blur-sm bg-white">
          <h3
            className="text-xl font-bold mb-4 text-center"
            style={{ fontFamily: "cursive", fontWeight: "800" }}
          >
            Select Course
          </h3>
          <Form
            onFinish={handleAssignCourses}
            layout="vertical"
            style={{ maxWidth: 400, margin: "0 auto" }}
          >
            <Form.Item name="course_ids">
              <Select mode="multiple" placeholder="Choose courses">
                {Array.isArray(courseList) &&
                  courseList.map((course) => (
                    <Select.Option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <button
              type="submit"
              className="w-full bg-black/15 border-2 rounded-2xl"
              style={{ fontFamily: "cursive" }}
            >
              Assign
            </button>
          </Form>
        </div>

        {/* Assigned Courses */}
        <div className="backdrop-blur-sm rounded-xl shadow-md p-6 bg-white">
          <h3 className="text-xl font-bold mb-4 text-center">My Courses</h3>
          {assignedCourses != null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignedCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-lg border hover:shadow-lg transition bg-black/20"
                >
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-600 hover:text-red-800 font-bold text-lg"
                    style={{
                      position: "relative",
                      left: "344px",
                      bottom: "20px",
                      color: "red",
                    }}
                    title="Unassign course"
                  >
                    −
                  </button>
                  <h4 className="text-lg font-bold text-gray-800">
                    {course.name}{" "}
                    <span className="text-sm font-semibold text-teal-600">
                      ({course.code})
                    </span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.student_count ?? 0} Student(s) Enrolled
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center">
              No courses assigned yet.
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "3",
    label: `My Students (${Object.keys(groupedStudents).length})`,
    children: (
      <div className="border-2 rounded-xl p-4">
        <ul className="space-y-4">
          {Object.entries(groupedStudents).map(([studentName, courses]) => (
            <li
              key={studentName}
              className="p-4 bg-gray-50 rounded-lg shadow-sm "
            >
              <div className="font-bold text-gray-800 mb-2">{studentName}</div>
              <ul className="ml-4 list-disc text-sm text-gray-600 space-y-1">
                {courses.map((course, i) => (
                  <li key={i}>
                    {course.course} ({course.code}) —{" "}
                    <span className="text-green-600">{course.status}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    key: "4",
    label: "Classes",
    children: (
      <div className="border-2 rounded-xl p-4">{user?.id && <ClassesPage />}</div>
    ),
  },
  {
    key: "5",
    label: "Calendar",
    children: (
      <div className="border-2 rounded-xl p-4">{user?.id && <TeacherCalender />}</div>
    ),
  },
  {
    key: "6",
    label: "CATS",
    children: (
      <div className="border-2 rounded-xl p-4">
        <CatScheduler slug = {slug} />
      </div>
    ),
  },
]

  return (
    <div
      className="relative min-h-screen w-full "
      style={{backgroundImage: user?.background_url ? `url(${user.background_url})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",}}
  
    >
      {/* Overlay */}
      <div className="absolute inset-0 " />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center rounded-xl shadow-lg px-6 py-4 m-6">
          <h2 
          className="border-2 bg-white  px-2"
          style={{fontFamily:"cursive", fontWeight:"bolder"}}
          >{user?.logo_text}</h2>
          <div className="text-right space-y-1 ">
            <p className="px-3 py-1 rounded-lg shadow  bg-white"
            style={{fontFamily:"cursive", fontWeight:"bolder"}}
            
            >
              {user?.fullname}
            </p>
            <p 
            style={{fontFamily:"cursive", fontWeight:"bolder"}}
            className="px-3 py-1 rounded-lg shadow  bg-white">
              {user?.department} Department
            </p>
          </div>
        </header>

        {/* Tabs */}
        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          <Tabs  
            style={{
    background: "white",
    fontFamily:" cursive",
   
    fontWeight: "800",
}}
            defaultActiveKey="1"
            items={tabItems}
            className=" backdrop-blur-sm rounded-xl shadow-md p-4"
          />
        </main>

        {/* Logout */}
        <footer className="flex justify-center py-6">
          <LogoutButton />
        </footer>
      </div>
    </div>
  )
}

export default TeacherDashboard
