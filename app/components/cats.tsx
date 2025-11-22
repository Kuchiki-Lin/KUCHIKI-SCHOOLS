"use client";

import { useEffect, useState } from "react";
import { Select, DatePicker, TimePicker, Button, message, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useUser } from "@/app/private";

const { Option } = Select;

interface CatSchedulerProps {
  teacherID: number | string;
  slug: string;
}

type CatType = {
  id: number;
  course_id: number;
  course_name: string;
  teacher_id: number;
  cat_datetime: string;
};

export default function CatScheduler({slug}:CatSchedulerProps) {
  console.log(slug);
  const [courses, setCourses] = useState<any[]>([]);
  const [catList, setCatList] = useState<CatType[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);

  // reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [newDate, setNewDate] = useState<Dayjs | null>(null);
  const [newTime, setNewTime] = useState<Dayjs | null>(null);

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/${slug}/cats/teacher/${user.id}`)
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
        cat_datetime: combinedDateTime,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      message.success(data.message);
      setSelectedCourse(null);
      setDate(null);
      setTime(null);
      fetchCats();
    } else {
      message.error(data.error || "Error scheduling CAT");
    }
  };

  // Delete CAT
  const handleDelete = async (id: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (res.ok) {
      message.success(data.message);
      fetchCats();
    } else {
      message.error(data.error || "Failed to delete CAT");
    }
  };

  // Open reschedule modal
  const handleReschedule = (id: number) => {
    setRescheduleModal({ open: true, id });
    setNewDate(null);
    setNewTime(null);
  };

  // Confirm reschedule
  const handleConfirmReschedule = async () => {
    if (!newDate || !newTime || !rescheduleModal.id) {
      message.warning("Please select new date and time");
      return;
    }

    const newDateTime = dayjs(newDate)
      .set("hour", newTime.hour())
      .set("minute", newTime.minute())
      .toISOString();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cats/${rescheduleModal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_datetime: newDateTime }),
    });

    const data = await res.json();
    if (res.ok) {
      message.success(data.message);
      fetchCats();
      setRescheduleModal({ open: false, id: null });
      setNewDate(null);
      setNewTime(null);
    } else {
      message.error(data.error || "Failed to reschedule CAT");
    }
  };

  return (
    <div className="p-6  mx-auto mt-4 border-2 rounded bg-white w-full">
      <h1 className="text-lg flex justify-center font-bold text-blue-700
      "
      style={{fontFamily:"cursive"}}
      >
        Schedule a CAT
      </h1>
      <div className="flex justify-center">



 <div className="grid grid-cols-1 sm:grid gap-4  border-4 p-4 rounded w-fit
      ">
        
      <Select
        className="w-[400px] mb-4 font-bold text-black "
        style={{fontFamily:"cursive",
          color:"black"
        }}
        placeholder="Select Course"
        value={selectedCourse ?? undefined}
        onChange={setSelectedCourse}
      >
        {courses.map((course: any) => (
          <Option 
          
          key={course.id} value={course.id}>
            {course.name} ({course.code})
          </Option>
        ))}
      </Select>

      <DatePicker
        style={{ marginTop: "20px", fontFamily:"cursive"

         }}
        className="w-[400px]
        b-4"
        value={date}
        onChange={(value) => setDate(value)}
      />

      <TimePicker
        style={{ marginTop: "20px" , fontFamily:"cursive"}}
        className="w-[400px]
        b-4"
        value={time}
        onChange={(value) => setTime(value)}
      />

      <Button type="primary" onClick={handleSchedule}
        className="text-black
        "
        style={{
          border:"2px solid black",
          backgroundColor:"white"
        }}
      >
        Schedule CAT
      </Button>


      </div>

        </div>
     

      {/* Upcoming CATs */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold  flex justify-center mb-4 text-blue-700
        ">
          Upcoming CATs
        </h2>

      <div className= "grid grid-cols-1 md:grid-cols-3 gap-4">

        {catList.length === 0 ? (
          <p >No scheduled CATs yet.</p>
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
                    : "bg-white border-black"
                } border-4`}
              >
                <p>
                  <strong className="text-red-700"
                  >Course:</strong> {cat.course_name}
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

      {/* Reschedule Modal */}
      <Modal
        title="Reschedule CAT"
        open={rescheduleModal.open}
        onCancel={() => setRescheduleModal({ open: false, id: null })}
        onOk={handleConfirmReschedule}
      >
        <div className="flex flex-col gap-2">
          <DatePicker value={newDate} onChange={(value) => setNewDate(value)} />
          <TimePicker value={newTime} onChange={(value) => setNewTime(value)} />
        </div>
      </Modal>
    </div>
  );
}
