"use client";

import { useEffect, useState } from "react";
import {
  Select,
  DatePicker,
  TimePicker,
  Button,
  message,
  Modal,
  Input
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useUser } from "@/app/private";

const { Option } = Select;

type CatType = {
  id: number;
  course_id: number;
  course_name: string;
  teacher_id: number;
  cat_datetime: string;
};


export default function CatScheduler() {
  const [courses, setCourses] = useState([]);
  const [catList, setCatList] = useState<CatType[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);

  const { user } = useUser();
  if (!user) return <p>Loading...</p>;
  const teacherId = user.id;


  

  // Fetch courses
  useEffect(() => {
    if (!user?.department) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/department/${user.department}`)
      .then((res) => res.json())
      .then(setCourses)
      .catch((err) => console.error("Error fetching courses:", err));
  }, [user?.department]);

  // Fetch CATs
  const fetchCats = () => {
   fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats/teacher/${user.id}`)
  .then((res) => res.json())
  .then((data) => {
    if (Array.isArray(data)) {
      setCatList(data);
    } else {
      setCatList([]);
      console.warn("Invalid data for CAT list", data);
    }
  })
  .catch(() => {
    setCatList([]);
    message.error("Failed to load CATs");
  });

  };

  useEffect(() => {
    if (user?.id) fetchCats();
  }, [user?.id]);

  // Schedule CAT
  const handleSchedule = async () => {
    if (!selectedCourse || !date || !time) {
      return message.warning("Please select all fields");
    }

    const combinedDateTime = dayjs(date)
      .set("hour", time.hour())
      .set("minute", time.minute())
      .toISOString();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: selectedCourse,
        teacher_id: teacherId,
        cat_datetime: combinedDateTime
      })
    });

    const data = await res.json();
    if (res.ok) {
      message.success(data.message);
      setSelectedCourse(null);
      setDate(null);
      setTime(null);
      fetchCats(); // Refresh
    } else {
      message.error(data.error || "Error scheduling CAT");
    }
  };

  // Delete CAT
  const handleDelete = async (id: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    if (res.ok) {
      message.success(data.message);
      fetchCats();
    } else {
      message.error(data.error || "Failed to delete CAT");
    }
  };

  // Reschedule CAT (basic prompt + confirmation)
  const handleReschedule = (id: number) => {
    Modal.confirm({
      title: "Reschedule CAT",
      content: (
        <div className="flex flex-col gap-2">
          <DatePicker onChange={(value) => setDate(value)} />
          <TimePicker onChange={(value) => setTime(value)} />
        </div>
      ),
      onOk: async () => {
        if (!date || !time) {
          message.warning("Please select new date and time");
          return Promise.reject();
        }

        const newDateTime = dayjs(date)
          .set("hour", time.hour())
          .set("minute", time.minute())
          .toISOString();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_datetime: newDateTime })
        });

        const data = await res.json();
        if (res.ok) {
          message.success(data.message);
          fetchCats();
        } else {
          message.error(data.error || "Failed to reschedule CAT");
        }
      }
    });
  }; 

  return (
    <div className="p-6 max-w-xl mx-auto mt-4  ">
      <h1 className="text-lg text-white  flex justify-center font-bold border-2 border-white">Schedule a CAT</h1>

      <Select
        className="w-full mb-4"
        placeholder="Select Course"
        value={selectedCourse}
        onChange={setSelectedCourse}
      >
        {courses.map((course: any) => (
          <Option key={course.id} value={course.id}>
            {course.name} ({course.code})
          </Option>
        ))}
      </Select>

      <DatePicker
style={{marginTop:"20px"}}

        className="w-full mb-4 "
        value={date}
        onChange={(value) => setDate(value)}
      />

      <TimePicker
      style={{marginTop:"20px"}}
        className="w-full mb-4"
        value={time}
        onChange={(value) => setTime(value)}
      />

      <Button type="primary" onClick={handleSchedule}>
        Schedule CAT
      </Button>

      {/* Pending CATs */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold  text-white border-2 border-white flex justify-center  mb-4">Upcoming CATs</h2>
        {catList.length === 0 ? (
          <p className="text-gray-500">No scheduled CATs yet.</p>
        ) : (
          catList.map((cat) => {
            const diff = dayjs(cat.cat_datetime).diff(dayjs(), "day");
            const isSoon = diff <= 2;

            return (
              <div
                key={cat.id}
                className={`p-4 mb-4 rounded shadow ${
                  isSoon
                    ? "bg-red-100 border-red-400"
                    : "bg-green-100 border-green-400"
                } border-l-4`}
              >
                <p>
  <strong>Course:</strong> {cat.course_name}
</p>

                <p>
                  <strong>Course ID:</strong> {cat.course_id}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {dayjs(cat.cat_datetime).format("YYYY-MM-DD HH:mm")}
                </p>
                <div className="flex gap-4 mt-2">
                  <Button danger onClick={() => handleDelete(cat.id)}>
                    Delete
                  </Button>
                  <Button onClick={() => handleReschedule(cat.id)}>
                    Reschedule
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
